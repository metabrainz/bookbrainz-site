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

// Redirect all requests to /${API_VERSION}/...
app.use('/*', (req, res) => {
	res.redirect(308, `/${API_VERSION}${req.originalUrl}`);
});

// Catch 404 and forward to error handler
mainRouter.use((req, res) => {
	res.status(404).send({message: `Incorrect endpoint ${req.path}`});
});

// initialize elasticsearch
// Clone object to prevent error if starting webserver and api
// https://github.com/elastic/elasticsearch-js/issues/33
search.init(app.locals.orm, Object.assign({}, config.search));

const DEFAULT_API_PORT = 9098;
app.set('port', process.env.PORT || DEFAULT_API_PORT);

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
appCleanup(cleanupFunction);

export default server;
