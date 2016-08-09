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

'use strict';

const path = require('path');

const Promise = require('bluebird');

const bodyParser = require('body-parser');
const express = require('express');
const favicon = require('serve-favicon');
const git = require('git-rev');
const jsx = require('node-jsx');
const logger = require('morgan');
const redis = require('connect-redis');
const session = require('express-session');
const staticCache = require('express-static-cache');

const bookbrainzData = require('bookbrainz-data');

const config = require('./helpers/config');

// Before we start pulling in local helpers, we need to initialize the database;
// otherwise, the models we depend on won't exist
bookbrainzData.init(config.database);

const auth = require('./helpers/auth');
const error = require('./helpers/error');
const search = require('./helpers/search');

// We need to install JSX before pulling in the routes, as they end up requiring
// React components written in JSX, and things will blow up
jsx.install({
	extension: '.jsx'
});

const routes = require('./routes');

const NotFoundError = require('./helpers/error').NotFoundError;

Promise.config({
	warnings: true,
	longStackTraces: true
});

// Initialize application
const app = express();

// Set up jade as view engine
app.set('views', path.join(__dirname, '../../templates'));
app.set('view engine', 'jade');
app.locals.basedir = app.get('views');

app.set('trust proxy', config.site.proxyTrust);

app.use(favicon(path.join(__dirname, '../../static/images/icons/favicon.ico')));

if (app.get('env') !== 'testing') {
	app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// Set up serving of static assets
app.use(staticCache(path.join(__dirname, '../../static/js'), {
	buffer: true
}));
app.use(express.static(path.join(__dirname, '../../static')));

const RedisStore = redis(session);
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


// Authentication code depends on session, so init session first
auth.init(app);
search.init(config.search);

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
	next(new NotFoundError());
});

// Error handler; arity MUST be 4 or express doesn't treat it as such
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	error.renderError(res, err);
});

const debug = require('debug')('bbsite');

app.set('port', process.env.PORT || 9099);

const server = app.listen(app.get('port'), () => {
	debug(`Express server listening on port ${server.address().port}`);
});
