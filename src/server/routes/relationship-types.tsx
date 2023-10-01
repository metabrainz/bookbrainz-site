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
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import {camelCase, startCase, upperFirst} from 'lodash';
import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RelationshipTypeMatrix from '../../client/components/pages/relationship-type-matrix';
import RelationshipTypesPage from '../../client/components/pages/relationshipTypes';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

router.get('/', (req, res) => {
	const props = generateProps(req, res);

	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<RelationshipTypeMatrix/>
		</Layout>
	);

	res.send(target({
		markup,
		page: 'RelationshipTypeMatrix',
		props: escapeProps(props),
		script: '/js/relationshipTypes.js',
		title: 'Relationship Types'
	}));
});

router.param('type1', middleware.checkValidEntityType);
router.param('type2', middleware.checkValidEntityType);

router.get('/:type1-:type2', async (req, res) => {
	const {type1, type2} = req.params;

	const EntityType1 = upperFirst(camelCase(type1));
	const EntityType2 = upperFirst(camelCase(type2));

	const {RelationshipType} = req.app.locals.orm;

	const rows = await RelationshipType.query((qb) => {
		// eslint-disable-next-line camelcase
		qb.where({source_entity_type: EntityType1, target_entity_type: EntityType2})
			// eslint-disable-next-line camelcase
			.orWhere({source_entity_type: EntityType2, target_entity_type: EntityType1});
	}).fetchAll();
	const relationshipTypes = rows.toJSON();

	const heading = `${startCase(type1)}-${startCase(type2)} relationship types`;
	const props = generateProps(req, res, {
		heading, relationshipTypes
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<RelationshipTypesPage {...propHelpers.extractChildProps(props)}/>
		</Layout>
	);
	res.send(target({
		markup,
		page: 'RelationshipTypes',
		props: escapeProps(props),
		script: '/js/relationshipTypes.js',
		title: heading
	}));
});

export default router;
