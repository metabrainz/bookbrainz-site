/*
 * Copyright (C) 2018 Shivam Tripathi
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

import * as auth from '../../helpers/auth';
import * as importRoutes from './import-routes';
import * as middleware from '../../helpers/middleware';
import * as utils from '../../helpers/utils';
import express from 'express';


const router = express.Router();

/* If the route specifies an importId, load the importEntity for it. */
router.param(
	'importId',
	middleware.makeImportLoader(
		'PublisherImport',
		['publisherType', 'area'],
		'Publisher Import not found'
	)
);

function _setPublisherTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Creator (Import)',
		utils.template`Creator (Import) “${'name'}”`
	);
}

router.get('/:importId', (req, res) => {
	_setPublisherTitle(res);
	importRoutes.displayImport(req, res);
});

router.get('/:importId/discard', auth.isAuthenticated, (req, res) => {
	_setPublisherTitle(res);
	importRoutes.displayDiscardImportEntity(req, res);
});

router.post(
	'/:importId/discard/handler',
	auth.isAuthenticatedForHandler,
	importRoutes.handleDiscardImportEntity
);

router.get(
	'/:importId/approve',
	auth.isAuthenticatedForHandler,
	importRoutes.approveImportEntity
);

router.get(
	'/:importId/edit',
	auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublisherTypes, middleware.loadLanguages,
	importRoutes.editImportEntity
);

router.post(
	'/:importId/edit/approve',
	auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublisherTypes, middleware.loadLanguages,
	importRoutes.approveImportPostEditing
);

export default router;
