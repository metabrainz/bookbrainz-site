/*
 * Copyright (C) 2023 Shivam Awasthi
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

import * as auth from '../helpers/auth';
import * as propHelpers from '../../client/helpers/props';

import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SearchAdminPage from '../../client/components/pages/searchAdmin';
import express from 'express';
import target from '../templates/target';


const {REINDEX_SEARCH_SERVER} = PrivilegeType;


const router = express.Router();

/**
 * Generates React markup for the search admin page that is rendered by the user's
 * browser.
 */
router.get('/', auth.isAuthenticated, auth.isAuthorized(REINDEX_SEARCH_SERVER), (req, res, next) => {
	try {
		const props = generateProps(req, res);
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<SearchAdminPage
					{...propHelpers.extractChildProps(props)}
				/>
			</Layout>
		);

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/searchAdmin.js',
			title: 'Search Admin'
		}));
	}
	catch (err) {
		return next(err);
	}
});

export default router;
