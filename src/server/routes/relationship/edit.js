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
const Relationship = require('../../data/relationship');
const RelationshipType = require('../../data/properties/relationship-type');
const Entity = require('../../data/entity');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const EditForm = React.createFactory(
	require('../../../client/components/forms/creator.jsx')
);
const Promise = require('bluebird');
const config = require('../../helpers/config');
const _ = require('underscore');

const relationshipHelper = {};

const loadEntityRelationships =
	require('../../helpers/middleware').loadEntityRelationships;

const makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

relationshipHelper.addEditRoutes = function addEditRoutes(router) {
	/* If the route specifies a BBID, load the Entity for it. */

	router.get('/:bbid/relationships', loadEntityRelationships, (req, res) => {
		const relationshipTypesPromise = RelationshipType.find();

		const entityPromises = {};

		res.locals.entity.relationships.forEach((relationship) => {
			entityPromises[relationship.entities[0].entity.entity_gid] =
				Entity.findOne(relationship.entities[0].entity.entity_gid);
			entityPromises[relationship.entities[1].entity.entity_gid] =
				Entity.findOne(relationship.entities[1].entity.entity_gid);
		});

		const entitiesPromise = Promise.props(entityPromises);

		Promise.join(entitiesPromise, relationshipTypesPromise,
			(entities, relationshipTypes) => {
				res.locals.entity.relationships.forEach((relationship) => {
					relationship.source =
						entities[relationship.entities[0].entity.entity_gid];
					relationship.target =
						entities[relationship.entities[1].entity.entity_gid];
					relationship.type =
						relationship.relationship_type.relationship_type_id;
				});

				const props = {
					relationshipTypes,
					relationships: res.locals.entity.relationships,
					entity: res.locals.entity,
					loadedEntities: _.union(entities, [res.locals.entity]),
					wsUrl: config.site.clientWebservice
				};

				const markup = ReactDOMServer.renderToString(EditForm(props));

				res.render('relationship/edit', {props, markup});
			}
		);
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
