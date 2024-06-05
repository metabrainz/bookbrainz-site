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

import * as auth from './helpers/auth';
import * as error from '../common/helpers/error';
import * as search from '../common/helpers/search';
import * as serverErrorHelper from './helpers/error';

import {repositoryUrl, siteRevision, userAgent} from './info';

import BookBrainzData from 'bookbrainz-data';
import Debug from 'debug';
import appCleanup from '../common/helpers/appCleanup';
import compression from 'compression';
import config from '../common/helpers/config';
import express from 'express';
import favicon from 'serve-favicon';
import initInflux from './influx';
import logNode from 'log-node';
import logger from 'morgan';
import path from 'path';
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

// Initialize application
const app = express();
app.locals.orm = BookBrainzData(config.database);

const rootDir = path.join(__dirname, '../../');

app.set('trust proxy', config.site.proxyTrust);

app.use(favicon(path.join(rootDir, 'static/images/icons/favicon.ico')));

if (app.get('env') !== 'testing') {
	app.use(logger('dev'));
}

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({
	extended: false
}));
app.use(compression());

// Set up serving of static assets
if (process.env.NODE_ENV === 'development') {
	/* eslint-disable node/global-require, node/no-unpublished-require, @typescript-eslint/no-var-requires */
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');

	// eslint-disable-next-line import/no-dynamic-require
	const webpackConfig = require(path.resolve(rootDir, './webpack.client'));
	/* eslint-enable node/global-require, node/no-unpublished-require, @typescript-eslint/no-var-requires */
	const compiler = webpack(webpackConfig);

	app.use(webpackDevMiddleware(compiler));
	app.use(webpackHotMiddleware(compiler));
}
else {
	app.use(serveStatic(path.join(rootDir, 'static/js')));
}
app.use(express.static(path.join(rootDir, 'static')));

app.use(session(process.env.NODE_ENV));


if (config.influx) {
	initInflux(app, config);
}

// Authentication code depends on session, so init session first
const authInitiated = auth.init(app);
let searchInitiated;

// Clone search config to prevent error if starting webserver and api
// https://github.com/elastic/elasticsearch-js/issues/33
(async function initializeSearch() {
	searchInitiated = await search.init(app.locals.orm, Object.assign({}, config.search));
})();

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

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	next(new error.NotFoundError(null, req));
});

// Error handler; arity MUST be 4 or express doesn't treat it as such
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
	serverErrorHelper.renderError(req, res, err);
});


const DEFAULT_PORT = 9099;
app.set('port', process.env.PORT || DEFAULT_PORT); // eslint-disable-line no-process-env

const server = app.listen(app.get('port'), () => {
	debug(`Express server listening on port ${server.address().port}`);
});

function cleanupFunction() {
	return new Promise((resolve, reject) => {
		debug('Cleaning up before closing');
		server.close((err) => {
			if (err) {
				debug('Error while closing server connections');
				reject(err);
			}
			else {
				debug('Closed all server connections. Bye bye!');
				resolve();
			}
		});
		// force-kill after X milliseconds.
		if (config.site.forceExitAfterMs) {
			setTimeout(() => {
				reject(new Error(`Cleanup function timed out after ${config.site.forceExitAfterMs} ms`));
			}, config.site.forceExitAfterMs);
		}
	});
}

// Run cleanup function
if (process.env.NODE_ENV !== 'test') {
	appCleanup(cleanupFunction);
}

export default server;
