/*
 * Copyright (C) 2014-2015  Ben Ockmore
 *               2015-2016  Sean Burke
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

import * as auth from './helpers/auth';
import * as error from './helpers/error';
import * as search from './helpers/search';
import BookBrainzData from 'bookbrainz-data';
import Debug from 'debug';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import compression from 'compression';
import config from './helpers/config';
import express from 'express';
import favicon from 'serve-favicon';
import git from 'git-rev';
import initInflux from './influx';
import logger from 'morgan';
import path from 'path';
import redis from 'connect-redis';
import routes from './routes';
import session from 'express-session';
import staticCache from 'express-static-cache';


Promise.config({
	longStackTraces: true,
	warnings: true
});

// Initialize application
const app = express();
app.locals.orm = BookBrainzData(config.database);

const rootDir = path.join(__dirname, '../../');

// Set up jade as view engine
app.set('views', path.join(rootDir, 'templates'));
app.set('view engine', 'jade');
app.locals.basedir = app.get('views');

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
app.use(staticCache(path.join(rootDir, 'static/js'), {
	buffer: true
}));
app.use(express.static(path.join(rootDir, 'static')));

const RedisStore = redis(session);
app.use(session({
	cookie: {
		secure: config.session.secure
	},
	resave: false,
	saveUninitialized: false,
	secret: config.session.secret,
	store: new RedisStore({
		host: config.session.redis.host,
		port: config.session.redis.port,
		ttl: config.session.redis.ttl
	})
}));

if (config.influx) {
	initInflux(app, config.influx);
}

// Authentication code depends on session, so init session first
auth.init(app);
search.init(app.locals.orm, config.search);

// Set up constants that will remain valid for the life of the app
git.short((revision) => {
	app.locals.siteRevision = revision;
});

app.locals.repositoryUrl = 'https://github.com/bookbrainz/bookbrainz-site/';

// Add user data to every rendered route
app.use((req, res, next) => {
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

export default server;
