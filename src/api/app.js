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
/* eslint global-require: 'warn' */


import * as error from '../server/helpers/error';

import BookBrainzData from 'bookbrainz-data';
import Debug from 'debug';
import Promise from 'bluebird';
import {get as _get} from 'lodash';
import appCleanup from '../server/helpers/appCleanup';
import bodyParser from 'body-parser';
import compression from 'compression';
import config from '../server/helpers/config';
import express from 'express';
import favicon from 'serve-favicon';
import git from 'git-rev';
import logger from 'morgan';
import path from 'path';
import redis from 'connect-redis';
import routes from './routes';
import serveStatic from 'serve-static';
import session from 'express-session';


Promise.config({
	longStackTraces: true,
	warnings: true
});

// Initialize application
const app = express();
app.locals.orm = BookBrainzData(config.database);

const rootDir = path.join(__dirname, '../../');

app.set('trust proxy', config.site.proxyTrust);

app.use(favicon(path.join(rootDir, 'static/images/icons/favicon.ico')));

if (app.get('env') !== 'testing') {
	app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(compression());

// Set up serving of static assets
if (process.env.NODE_ENV === 'development') {
	const webpack = require('webpack');
	const webpackDevMiddleware = require('webpack-dev-middleware');
	const webpackHotMiddleware = require('webpack-hot-middleware');

	const webpackConfig = require(path.resolve(rootDir, './webpack.client'));
	const compiler = webpack(webpackConfig);

	app.use(webpackDevMiddleware(compiler, {
		// lazy: false,
		logTime: true,
		noInfo: false,
		publicPath: webpackConfig.output.publicPath
		// serverSideRender: false
	}));

	app.use(webpackHotMiddleware(compiler));
}
else {
	app.use(serveStatic(path.join(rootDir, 'static/js')));
}
app.use(express.static(path.join(rootDir, 'static')));

const RedisStore = redis(session);
app.use(session({
	cookie: {
		maxAge: _get(config, 'session.maxAge', 2592000000),
		secure: _get(config, 'session.secure', false)
	},
	resave: false,
	saveUninitialized: false,
	secret: config.session.secret,
	store: new RedisStore({
		host: _get(config, 'session.redis.host', 'localhost'),
		port: _get(config, 'session.redis.port', 6379)
	})
}));


// Set up constants that will remain valid for the life of the app
let siteRevision = 'unknown';
git.short((revision) => {
	siteRevision = revision;
});

const repositoryUrl = 'https://github.com/bookbrainz/bookbrainz-site/';

app.use((req, res, next) => {
	// Set up globally-used properties
	res.locals.siteRevision = siteRevision;
	res.locals.repositoryUrl = repositoryUrl;
	res.locals.alerts = [];

	if (!req.session) {
		res.locals.alerts.push({
			level: 'danger',
			message: 'We are currently experiencing technical difficulties; ' +
				'signing in will not work until this is resolved.'
		});
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
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	error.renderError(req, res, err);
});

const debug = Debug('bbsite');

const DEFAULT_PORT = 9099;
app.set('port', process.env.PORT || DEFAULT_PORT); // eslint-disable-line no-process-env,max-len

const server = app.listen(app.get('port'), () => {
	debug(`Express server listening on port ${server.address().port}`);
});

/* eslint-disable no-console */
function cleanupFunction() {
	return new Promise((resolve, reject) => {
		console.log('Cleaning up before closing');
		server.close((err) => {
			if (err) {
				console.log('Error while closing server connections');
				reject(err);
			}
			else {
				console.log('Closed all server connections. Bye bye!');
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
/* eslint-enable no-console */

// Run cleanup function
appCleanup(cleanupFunction);

export default server;
