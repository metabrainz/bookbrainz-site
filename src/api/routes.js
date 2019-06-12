/*
 * Copyright (C) 2019  Akhilesh Kumar
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

import authorRouter from './routes/author';
import editionGroupRouter from './routes/edition-group';
import editionRouter from './routes/edition';
import workRouter from './routes/work';


function initWorkRoute(app) {
	app.use('/work', workRouter);
}

function initEditionRoute(app) {
	app.use('/edition', editionRouter);
}

function initEditionGroupRoute(app) {
	app.use('/edition-group', editionGroupRouter);
}

function initAuthorRoute(app) {
	app.use('/author', authorRouter);
}


function initRoutes(app) {
	initWorkRoute(app);
	initEditionRoute(app);
	initEditionGroupRoute(app);
	initAuthorRoute(app);
}

export default initRoutes;
