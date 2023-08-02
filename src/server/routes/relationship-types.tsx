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
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RelationshipTypesPage from '../../client/components/pages/relationshipTypes';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

const {RELATIONSHIP_TYPE_EDITOR} = PrivilegeType;

router.get('/', auth.isAuthenticated, auth.isAuthorized(RELATIONSHIP_TYPE_EDITOR), middleware.loadRelationshipTypes, (req, res) => {
	const {relationshipTypes} = res.locals;
	const props = generateProps(req, res, {
		relationshipTypes
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<RelationshipTypesPage {...propHelpers.extractChildProps(props)}/>
		</Layout>
	);
	res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/relationshipTypes.js',
		title: 'Relationship Types'
	}));
});

export default router;