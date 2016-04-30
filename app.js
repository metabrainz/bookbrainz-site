/*
 * Copyright (C) 2014-2015  Ben Ockmore
 *                    2015  Sean Burke
 *                    2015  Leo Verto
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

'use strict';

const path = require('path');

const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const staticCache = require('express-static-cache');

const Promise = require('bluebird');
Promise.config({
	warnings: true,
	longStackTraces: true
});

const config = require('./src/server/helpers/config');

/* -data needs to be initialized before pulling in auth. */
require('bookbrainz-data').init(config.database);
const auth = require('./src/server/helpers/auth');

const git = require('git-rev');

// Initialize application
const app = express();

// Set up jade as view engine
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');
app.locals.basedir = app.get('views');

require('node-jsx').install({
	extension: '.jsx'
});

require('./src/server/helpers/search').init(config.search);

app.set('trust proxy', config.site.proxyTrust);

app.use(favicon(path.join(__dirname, 'static/images/icons/favicon.ico')));

if (app.get('env') !== 'testing') {
	app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(staticCache(path.join(__dirname, 'static/js'), {
	buffer: true
}));

app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
	store: new RedisStore({
		host: config.session.redis.host,
		port: config.session.redis.port,
		ttl: config.session.redis.ttl
	}),
	cookie: {
		secure: config.session.secure
	},
	secret: config.session.secret,
	resave: false,
	saveUninitialized: false
}));

auth.init(app);

let siteRevision = null;
git.short((revision) => {
	siteRevision = revision;
});

/* Add middleware to set variables used for every rendered route. */
app.use((req, res, next) => {
	res.locals.user = req.user;
	res.locals.repositoryUrl = 'https://github.com/bookbrainz/bookbrainz-site/';
	res.locals.siteRevision = siteRevision;

	next();
});

// Set up routes
require('./src/server/routes')(app);

const NotFoundError = require('./src/server/helpers/error').NotFoundError;

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	next(new NotFoundError());
});

const error = require('./src/server/helpers/error');

// Error handler; arity MUST be 4 or express doesn't treat it as such
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	error.renderError(res, err);
});

module.exports = app;
