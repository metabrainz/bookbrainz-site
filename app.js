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
const ElasticSearch = require('elasticsearch');

const Promise = require('bluebird');
Promise.longStackTraces();

const config = require('./src/server/helpers/config');

/* -data needs to be initialized before pulling in auth. */
require('bookbrainz-data').init(config.database);
const auth = require('./src/server/helpers/auth');

const status = require('http-status');

// Initialize application
const app = express();

// Set up jade as view engine
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'jade');
app.locals.basedir = app.get('views');

require('node-jsx').install({
	extension: '.jsx'
});

// Set up elasticsearch
const esClient = new ElasticSearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});

app.set('esClient', esClient);

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

/* Add middleware to set variables used for every rendered route. */
app.use((req, res, next) => {
	res.locals.user = req.user;
	res.locals.inboxCount = 0;
	next();
});

// Set up routes
require('./src/server/routes')(app);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = status.NOT_FOUND;
	next(err);
});

// Error handlers

/* Development error handler; displays stacktrace to user */
if (app.get('env') === 'development') {
	app.use((err, req, res) => {
		console.log(`Internal Error. Message: ${err.message} Stacktrace...`);
		console.log(err.stack);

		res.status(err.status || status.INTERNAL_SERVER_ERROR);

		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

/* Production error handler; stacktrace is omitted */
app.use((err, req, res) => {
	res.status(err.status || status.INTERNAL_SERVER_ERROR);

	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
