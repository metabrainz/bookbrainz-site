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

var auth = require('../../helpers/auth');
var Relationship = require('../../data/relationship');
var RelationshipType = require('../../data/properties/relationship-type');
var Entity = require('../../data/entity');
var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/creator.jsx'));
var Promise = require('bluebird');
var config = require('../../helpers/config');
var _ = require('underscore');

var relationshipHelper = {};

var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

relationshipHelper.addEditRoutes = function(router) {
	/* If the route specifies a BBID, load the Creator for it. */
	router.param('bbid', makeEntityLoader(Entity, 'Entity not found'));

	router.get('/:bbid/relationships', loadEntityRelationships, function relationshipEditor(req, res) {
		var relationshipTypesPromise = RelationshipType.find();

		var entityPromises = {};

		res.locals.entity.relationships.forEach((relationship) => {
			entityPromises[relationship.entities[0].entity.entity_gid] =
				Entity.findOne(relationship.entities[0].entity.entity_gid);
			entityPromises[relationship.entities[1].entity.entity_gid] =
				Entity.findOne(relationship.entities[1].entity.entity_gid);
		});

		const entitiesPromise = Promise.props(entityPromises);

		Promise.join(entitiesPromise, relationshipTypesPromise,
			function(entities, relationshipTypes) {
				res.locals.entity.relationships.forEach((relationship) => {
					relationship.source = entities[relationship.entities[0].entity.entity_gid];
					relationship.target = entities[relationship.entities[1].entity.entity_gid];
					relationship.type = relationship.relationship_type.relationship_type_id;
				});

				var props = {
					relationshipTypes: relationshipTypes,
					relationships: res.locals.entity.relationships,
					entity: res.locals.entity,
					loadedEntities: _.union(entities, [res.locals.entity]),
					wsUrl: config.site.clientWebservice
				};

				var markup = React.renderToString(EditForm(props));

				res.render('relationship/edit', {
					props: props,
					markup: markup
				});
			});
	});

	router.post('/:bbid/relationships/handler', auth.isAuthenticated, function(req, res) {
		// Send a relationship revision for each of the relationships
		const relationshipsPromise = Promise.all(
			req.body.map((relationship) =>
				Relationship.create(relationship, {
					session: req.session
				})
			)
		);

		relationshipsPromise.then(() => {
			res.send({result: "success"});
		})
		.catch(() => {
			res.send({result: "error"});
		});
	});
};

module.exports = relationshipHelper;
