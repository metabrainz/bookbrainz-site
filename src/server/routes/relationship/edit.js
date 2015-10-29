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
const EditForm = React.createFactory(require('../../../client/components/forms/creator.jsx'));
const Promise = require('bluebird');
const config = require('../../helpers/config');

const relationshipHelper = {};

relationshipHelper.addEditRoutes = function addEditRoutes(router) {
	router.get('/:bbid/relationships', auth.isAuthenticated, (req, res) => {
		const relationshipTypesPromise = RelationshipType.find();
		const entityPromise = Entity.findOne(req.params.bbid, {
			populate: [
				'aliases'
			]
		});

		Promise.join(entityPromise, relationshipTypesPromise,
			(entity, relationshipTypes) => {
				const props = {
					relationshipTypes,
					targetEntity: entity,
					wsUrl: config.site.clientWebservice
				};

				const markup = React.renderToString(EditForm(props));

				res.render('relationship/edit', {props, markup});
			}
		);
	});

	router.post('/:bbid/relationships/handler', auth.isAuthenticated,
		(req, res) => {
			req.body.forEach((relationship) => {
				// Send a relationship revision for each of the relationships
				const changes = relationship;

				Relationship.create(changes, {
					session: req.session
				}).then(res.send);
			});
		}
	);
};

module.exports = relationshipHelper;
