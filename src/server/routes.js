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

import authRouter from './routes/auth';
import creatorRouter from './routes/entity/creator';
import editionRouter from './routes/entity/edition';
import editorRouter from './routes/editor';
import indexRouter from './routes/index';
import publicationRouter from './routes/entity/publication';
import publisherRouter from './routes/entity/publisher';
import registerRouter from './routes/register';
import revisionRouter from './routes/revision';
import searchRouter from './routes/search';
import statisticsRouter from './routes/statistics';
import workRouter from './routes/entity/work';


function initRootRoutes(app) {
	app.use('/', indexRouter);
	app.use('/', authRouter);
	app.use('/search', searchRouter);
	app.use('/register', registerRouter);
	app.use('/statistics', statisticsRouter);
}

function initPublicationRoutes(app) {
	app.use('/publication', publicationRouter);
}

function initCreatorRoutes(app) {
	app.use('/creator', creatorRouter);
}

function initEditionRoutes(app) {
	app.use('/edition', editionRouter);
}

function initWorkRoutes(app) {
	app.use('/work', workRouter);
}

function initPublisherRoutes(app) {
	app.use('/publisher', publisherRouter);
}

function initRevisionRoutes(app) {
	app.use('/revision', revisionRouter);
}

function initRoutes(app) {
	initRootRoutes(app);

	initPublicationRoutes(app);
	initCreatorRoutes(app);
	initEditionRoutes(app);
	initWorkRoutes(app);
	initPublisherRoutes(app);
	initRevisionRoutes(app);

	app.use('/editor', editorRouter);
}

export default initRoutes;
