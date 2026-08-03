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

import * as search from '../common/helpers/search';
import BookBrainzData from 'bookbrainz-data';
import Debug from 'debug';
import appCleanup from '../common/helpers/appCleanup';
import compression from 'compression';
import config from '../common/helpers/config';
import express from 'express';
import initRoutes from './routes';
import logger from 'morgan';
import session from '../common/helpers/session';

// 🔹 Centralized text constants for future internationalization (i18n)
const TEXT = {
  incorrectEndpoint: (path) => `Incorrect endpoint ${path}`,
  serverStart: (port) => `Express server listening on port ${port}`,
  cleanupStart: 'Cleaning up before closing',
  cleanupError: 'Error while closing server connections',
  cleanupSuccess: 'Closed all server connections. Bye bye!'
};

// Initialize application
const app = express();
app.locals.orm = BookBrainzData(config.database);

const debug = Debug('bbapi');

app.set('trust proxy', config.site.proxyTrust);

if (app.get('env') !== 'testing') {
	app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(compression());

app.use(session(process.env.NODE_ENV));

// Set up routes
const mainRouter = initRoutes();
const API_VERSION = process.env.API_VERSION || '1';
app.use(`/${API_VERSION}`, mainRouter);

// Catch 404 and forward to error handler
mainRouter.use((req, res) => {
	res.status(404).send({message: TEXT.incorrectEndpoint(req.path)});
});

// Root endpoint redirects to live docs page
app.get('/', (req, res) => {
	res.redirect(308, `/${API_VERSION}/docs`);
});

// Redirect all other requests to /${API_VERSION}/...
app.use('/*', (req, res) => {
	res.redirect(308, `/${API_VERSION}${req.originalUrl}`);
});

// initialize elasticsearch
search.init(app.locals.orm, Object.assign({}, config.search));

const DEFAULT_API_PORT = 9098;
app.set('port', process.env.PORT || DEFAULT_API_PORT);

const server = app.listen(app.get('port'), () => {
	debug(TEXT.serverStart(server.address().port));
});

function cleanupFunction() {
	return new Promise((resolve, reject) => {
		debug(TEXT.cleanupStart);
		server.close((err) => {
			if (err) {
				debug(TEXT.cleanupError);
				reject(err);
			}
			else {
				debug(TEXT.cleanupSuccess);
				resolve();
			}
		});
		if (config.site.forceExitAfterMs) {
			setTimeout(() => {
				reject(new Error(`Cleanup function timed out after ${config.site.forceExitAfterMs} ms`));
			}, config.site.forceExitAfterMs);
		}
	});
}

// Run cleanup function
appCleanup(cleanupFunction);

export default server;