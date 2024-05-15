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

import adminLogsRouter from './routes/adminLogs';
import adminPanelRouter from './routes/adminPanel';
import authRouter from './routes/auth';
import authorRouter from './routes/entity/author';
import collectionRouter from './routes/collection';
import collectionsRouter from './routes/collections';
import editionGroupRouter from './routes/entity/edition-group';
import editionRouter from './routes/entity/edition';
import editorRouter from './routes/editor';
import externalServiceRouter from './routes/externalService';
import identifierTypeRouter from './routes/type-editor/identifier-type';
import identifierTypesRouter from './routes/identifier-types';
import indexRouter from './routes/index';
import mergeRouter from './routes/merge';
import publisherRouter from './routes/entity/publisher';
import registerRouter from './routes/register';
import relationshipTypeRouter from './routes/type-editor/relationship-type';
import relationshipTypesRouter from './routes/relationship-types';
import reviewsRouter from './routes/reviews';
import revisionRouter from './routes/revision';
import revisionsRouter from './routes/revisions';
import searchAdminRouter from './routes/searchAdmin';
import searchRouter from './routes/search';
import seriesRouter from './routes/entity/series';
import statisticsRouter from './routes/statistics';
import unifiedFormRouter from './routes/unifiedform';
import wikimediaRouter from './routes/wikimedia';
import workRouter from './routes/entity/work';


function initRootRoutes(app) {
	app.use('/', indexRouter);
	app.use('/', authRouter);
	app.use('/', unifiedFormRouter);
	app.use('/', reviewsRouter);
	app.use('/', wikimediaRouter);
	app.use('/search', searchRouter);
	app.use('/register', registerRouter);
	app.use('/revisions', revisionsRouter);
	app.use('/collections', collectionsRouter);
	app.use('/statistics', statisticsRouter);
	app.use('/external-service', externalServiceRouter);
	app.use('/admin-panel', adminPanelRouter);
	app.use('/search-admin', searchAdminRouter);
	app.use('/admin-logs', adminLogsRouter);
	app.use('/relationship-type', relationshipTypeRouter);
	app.use('/relationship-types', relationshipTypesRouter);
	app.use('/identifier-type', identifierTypeRouter);
	app.use('/identifier-types', identifierTypesRouter);
}

function initEditionGroupRoutes(app) {
	/* Retro-compatibility for /publication links */
	app.use(['/edition-group', '/publication'], editionGroupRouter);
}

function initAuthorRoutes(app) {
	/* Retro-compatibility for /creator links stored in MusicBrainz */
	app.use(['/author', '/creator'], authorRouter);
}

function initEditionRoutes(app) {
	app.use('/edition', editionRouter);
}

function initMergeRoutes(app) {
	app.use('/merge', mergeRouter);
}

function initSeriesRoutes(app) {
	app.use('/series', seriesRouter);
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

function initEditorRoutes(app) {
	app.use('/editor', editorRouter);
}

function initCollectionRoutes(app) {
	app.use('/collection', collectionRouter);
}

function initRoutes(app) {
	initRootRoutes(app);
	initEditionGroupRoutes(app);
	initAuthorRoutes(app);
	initCollectionRoutes(app);
	initEditionRoutes(app);
	initMergeRoutes(app);
	initSeriesRoutes(app);
	initWorkRoutes(app);
	initPublisherRoutes(app);
	initRevisionRoutes(app);
	initEditorRoutes(app);
}

export default initRoutes;
