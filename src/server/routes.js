/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

/* eslint global-require: 0 */

'use strict';

const relationshipHelper = require('./routes/relationship/edit');

function initRootRoutes(app) {
	app.use('/', require('./routes/index'));
	app.use('/', require('./routes/login'));
	app.use('/register', require('./routes/register'));
}

function initPublicationRoutes(app) {
	const router = require('./routes/entity/publication');

	app.use('/publication', router);
	relationshipHelper.addEditRoutes(router);
}

function initCreatorRoutes(app) {
	const router = require('./routes/entity/creator');

	app.use('/creator', router);
	relationshipHelper.addEditRoutes(router);
}

function initEditionRoutes(app) {
	const router = require('./routes/entity/edition');

	app.use('/edition', router);
	relationshipHelper.addEditRoutes(router);
}

function initWorkRoutes(app) {
	const router = require('./routes/entity/work');

	app.use('/work', router);
	relationshipHelper.addEditRoutes(router);
}

function initPublisherRoutes(app) {
	const router = require('./routes/entity/publisher');

	app.use('/publisher', router);
	relationshipHelper.addEditRoutes(router);
}

function initRevisionRoutes(app) {
	const router = require('./routes/revision');
	app.use('/revision', router);
}

module.exports = function initRoutes(app) {
	initRootRoutes(app);

	initPublicationRoutes(app);
	initCreatorRoutes(app);
	initEditionRoutes(app);
	initWorkRoutes(app);
	initPublisherRoutes(app);
	initRevisionRoutes(app);

	app.use('/editor', require('./routes/editor'));
	app.use('/message', require('./routes/message'));
};
