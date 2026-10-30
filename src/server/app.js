/*
 * Copyright (C) 2014-2015  Ben Ockmore
 *               2015-2017  Sean Burke
 *               2015       Leo Verto
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* eslint-disable node/no-process-env */

// Must stay the first import so Sentry can instrument the modules loaded after it
// eslint-disable-next-line import/no-unassigned-import
import './instrument';

import * as Sentry from '@sentry/node';
import * as auth from './helpers/auth';
import * as errors from '../common/helpers/error';
import * as search from '../common/helpers/search';
import * as serverErrorHelper from './helpers/error';

import {repositoryUrl, siteRevision, userAgent} from './info';

import BookBrainzData from 'bookbrainz-data';
import Debug from 'debug';
import appCleanup from '../common/helpers/appCleanup';
import compression from 'compression';
import config from '../common/helpers/config';
import {createRouterBridge} from './helpers/router-build';
import express from 'express';
import favicon from 'serve-favicon';
import initInflux from './influx';
import log from 'log';
import logNode from 'log-node';
import logger from 'morgan';
import path from 'path';
import redisClient from '../common/helpers/cache';
import routes from './routes';
import serveStatic from 'serve-static';
import session from '../common/helpers/session';


// Initialize log-to-stdout  writer
logNode({
	env: {
		LOG_LEVEL: config.site.log
	}
});
const debug = Debug('bbsite');

const rootDir = path.join(__dirname, '../../');

/**
 * Create the Express app and everything it owns: the ORM, authentication, the search client and the React Router
 * build. Nothing is started on import. If something cannot be created (the router build above all) this rejects
 * after closing what was already created.
 * @param {Object} [options] - optional application dependencies
 * @param {Object} [options.orm] - an existing ORM owned by the caller - an ORM to use instead of the one created from the configuration (tests share one)
 * @returns {Promise<Object>} the app and a function that releases its resources
 */
export async function createApp({orm: sharedOrm} = {}) {
	const app = express();
	const ownsOrm = !sharedOrm;
	const orm = sharedOrm || BookBrainzData(config.database);
	app.locals.orm = orm;
	// What this function created, tracked apart from whether it works: close() releases all of it
	let searchInitiated = false;
	let searchInitialization = null;
	let searchClient = null;
	let bridge = null;
	let closed = false;

	async function close() {
		if (closed) {
			return;
		}
		closed = true;
		const failures = [];
		async function attempt(release) {
			try {
				await release();
			}
			catch (error) {
				failures.push(error);
			}
		}
		await attempt(() => bridge?.close());
		// The client exists as soon as the initialization starts; closing it also ends a connection attempt in progress
		await attempt(async () => {
			if (searchInitialization) {
				await searchClient?.close();
				await searchInitialization.catch(() => null);
			}
		});
		// The session store and the cache share this client; it connects when the sessions are set up
		await attempt(async () => {
			if (redisClient.isOpen) {
				await redisClient.quit();
			}
		});
		if (ownsOrm) {
			await attempt(() => orm.bookshelf.knex.destroy());
		}
		if (failures.length) {
			throw failures.length === 1 ? failures[0] : new globalThis.AggregateError(failures, 'Could not release all resources');
		}
	}

	try {
		bridge = await createRouterBridge({
			getSearchClient: () => (searchInitiated ? searchClient : null),
			mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
			orm,
			rootDir
		});


		app.set('trust proxy', config.site.proxyTrust);

		app.use(favicon(path.join(rootDir, 'static/images/icons/favicon.ico')));

		if (app.get('env') !== 'testing') {
			app.use(logger('dev'));
		}

		app.use((req, res, next) => {
		// "A man is not dead while his name is still spoken."
		// - Going Postal, Terry Pratchett
			res.set('X-Clacks-Overhead', 'GNU Terry Pratchett, Robert "mayhem" Kaye');
			next();
		});

		app.use(express.json({
			limit: '10mb',
			verify: (req, res, buffer) => {
				if (req.originalUrl === '/webhooks/metabrainz/') {
				// Attach the raw buffer for OAuth webhook signature verification
					req.rawBody = buffer;
				}
			}
		}));
		app.use((err, req, res, next) => {
			if (err?.type === 'entity.parse.failed' && req.path === '/webhooks/metabrainz/') {
			//  for OAuth webhook signature verification, we need the raw body, so if JSON parsing fails,
			// we should still attempt to verify the signature and respond accordingly
				return res.status(400).json({error: 'Invalid JSON payload'});
			}
			return next(err);
		});
		app.use(express.urlencoded({
			extended: false
		}));
		app.use(compression());

		// Set up serving of static assets
		if (process.env.NODE_ENV === 'development') {
		/* eslint-disable node/global-require, node/no-unpublished-require, @typescript-eslint/no-require-imports */
			const webpack = require('webpack');
			const webpackDevMiddleware = require('webpack-dev-middleware');
			const webpackHotMiddleware = require('webpack-hot-middleware');

			// eslint-disable-next-line import/no-dynamic-require
			const webpackConfig = require(path.resolve(rootDir, './webpack.client'));
			/* eslint-enable node/global-require, node/no-unpublished-require, @typescript-eslint/no-require-imports */
			const compiler = webpack(webpackConfig);

			app.use(webpackDevMiddleware(compiler));
			app.use(webpackHotMiddleware(compiler));
		}
		else {
			app.use(serveStatic(path.join(rootDir, 'static/js')));
		}
		app.use(express.static(path.join(rootDir, 'static')));
		bridge.assets.forEach((middleware) => app.use(middleware));

		app.use(session(process.env.NODE_ENV));


		if (config.influx) {
			initInflux(app, config);
		}

		// Authentication code depends on session, so init session first
		const authInitiated = auth.init(app);

		// Clone search config to prevent error if starting webserver and api
		// https://github.com/elastic/elasticsearch-js/issues/33
		// Not awaited: the site starts without search, and shows an alert, while the search server is unreachable
		searchInitialization = search.init(app.locals.orm, Object.assign({}, config.search)).then((initiated) => {
			searchInitiated = initiated && !closed;
		}).catch((error) => log.error('Search initialization failed:', error));
		searchClient = search.getClient();

		// Set up constants that will remain valid for the life of the app
		debug(`Git revision: ${siteRevision}`);
		debug('User-Agent:', userAgent);

		app.use((req, res, next) => {
		// Set up globally-used properties
			res.locals.siteRevision = siteRevision;
			res.locals.repositoryUrl = repositoryUrl;
			res.locals.alerts = [];
			req.signUpDisabled = false;
			if (process.env.DEPLOY_ENV === 'test' || process.env.DEPLOY_ENV === 'beta') {
				let msg;
				if (process.env.DEPLOY_ENV === 'beta') {
					msg = 'You are on the beta website, which uses the main database but with a newer version of the code to test new features.';
				}
				else {
					msg = 'You are on the test website; all changes made here are not synced with the main database and will be overwritten periodically.';
				}
				res.locals.alerts.push({
					level: 'info',
					message: `${msg}`
				});
			}

			if (!searchInitiated) {
				const msg = 'We could not connect to our search server, all search functionality is unavailable.';
				res.locals.alerts.push({
					level: 'danger',
					message: `${msg}`
				});
			}

			if (!req.session || !authInitiated) {
				res.locals.alerts.push({
					level: 'danger',
					message: `We are currently experiencing technical difficulties;
					signing in and signing up are disabled until this is resolved.`
				});
				req.signUpDisabled = true;
			}

			// Add user data to every rendered route
			res.locals.user = req.user;

			next();
		});

		// Set up routes
		routes(app);

		// Whatever the Express routes did not handle goes to React Router (the migrated pages and the 404 page)
		app.get('*', bridge.handler);

		// Catch 404 and forward to error handler
		app.use((req, res, next) => {
			next(new errors.NotFoundError(null, req));
		});

		// Report errors to Sentry before the app's own error handler renders them
		Sentry.setupExpressErrorHandler(app);

		// Error handler; arity MUST be 4 or express doesn't treat it as such
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		app.use((err, req, res, next) => {
			serverErrorHelper.renderError(req, res, err);
		});

		return {app, close};
	}
	catch (error) {
		// Release what exists; the error that stopped the startup is the one reported
		await close().catch((cleanupError) => log.error('Cleanup after the failed startup also failed:', cleanupError));
		throw error;
	}
}

const DEFAULT_PORT = 9099;

/**
 * Create the app, then start listening. The server only listens once everything it needs is ready; if anything
 * fails, what was created is closed and the process exits with an error.
 * @returns {Promise<Object>} a function that stops the server and releases its resources
 */
export async function start() {
	const {app, close: closeApp} = await createApp();
	const port = process.env.PORT || DEFAULT_PORT;
	const server = await new Promise((resolve, reject) => {
		const listening = app.listen(port, () => resolve(listening));
		listening.once('error', reject);
	}).catch(async (error) => {
		await closeApp().catch((cleanupError) => log.error('Cleanup after the failed startup also failed:', cleanupError));
		throw error;
	});
	debug(`Express server listening on port ${server.address().port}`);

	async function close() {
		const failures = [];
		let timer;
		try {
			await new Promise((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
				if (config.site.forceExitAfterMs) {
					timer = setTimeout(() => reject(new Error('HTTP shutdown timed out')), config.site.forceExitAfterMs);
				}
			});
		}
		catch (error) { failures.push(error); }
		finally { clearTimeout(timer); }
		try { await closeApp(); }
		catch (error) { failures.push(error); }
		if (failures.length) {
			throw failures.length === 1 ? failures[0] : new globalThis.AggregateError(failures, 'Could not shut down the application');
		}
	}

	appCleanup(close);
	return {close};
}

// Started by `node lib/server/app.js` and `yarn debug`, not when the tests import this file
if (require.main === module) {
	start().catch((error) => {
		// eslint-disable-next-line no-console
		console.error('Could not start the server:', error);
		process.exitCode = 1;
	});
}
