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

'use strict';

const auth = require('../../helpers/auth');
const Relationship = require('bookbrainz-data').Relationship;
const RelationshipType = require('bookbrainz-data').RelationshipType;
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const EditForm = React.createFactory(
	require('../../../client/components/forms/relationship.jsx')
);
const Promise = require('bluebird');
const _ = require('underscore');

const relationshipHelper = {};

const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;

relationshipHelper.addEditRoutes = function addEditRoutes(router) {
	router.get('/:bbid/relationships', loadEntityRelationships, (req, res) => {
		const relationshipTypesPromise = new RelationshipType().fetchAll();

		const loadedEntities = {};
		res.locals.entity.relationships.forEach((relationship) => {
			loadedEntities[relationship.sourceBbid] = relationship.source;
			loadedEntities[relationship.targetBbid] = relationship.target;
		});

		relationshipTypesPromise
		.then((collection) => collection.toJSON())
		.then((relationshipTypes) => {
			// _.omit is used here to avoid "Circular reference" errors
			const props = {
				entity: _.omit(res.locals.entity, 'relationships'),
				relationships: res.locals.entity.relationships,
				relationshipTypes,
				loadedEntities
			};

			const markup = ReactDOMServer.renderToString(EditForm(props));

			res.render('relationship/edit', {props, markup});
		});
	});

	router.post('/:bbid/relationships/handler', auth.isAuthenticated,
		(req, res) => {
			// Send a relationship revision for each of the relationships
			const relationshipsPromise = Promise.all(
				req.body.map((relationship) =>
					Relationship.create(relationship, {
						session: req.session
					})
				)
			);

			relationshipsPromise.then(() => {
				res.send({result: 'success'});
			})
			.catch(() => {
				res.send({result: 'error'});
			});
		}
	);
};

module.exports = relationshipHelper;
