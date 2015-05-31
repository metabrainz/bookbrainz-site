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

var auth = require('../../helpers/auth');
var Relationship = require('../../data/relationship');
var RelationshipType = require('../../data/properties/relationship-type');
var Entity = require('../../data/entity');
var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/creator.jsx'));
var Promise = require('bluebird');
var config = require('../../helpers/config');

var relationshipHelper = {};

relationshipHelper.addEditRoutes = function(router) {
	router.get('/:bbid/relationships', auth.isAuthenticated, function relationshipEditor(req, res) {
		var relationshipTypesPromise = RelationshipType.find();
		var entityPromise = Entity.findOne(req.params.bbid, {
				populate: [
					'aliases'
				]
			});

		Promise.join(entityPromise, relationshipTypesPromise,
			function(entity, relationshipTypes) {
				var props = {
					relationshipTypes: relationshipTypes,
					targetEntity: entity,
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
		req.body.forEach(function(relationship) {
			// Send a relationship revision for each of the relationships
			var changes = relationship;

			Relationship.create(changes, {
					session: req.session
				})
				.then(function(revision) {
					res.send(revision);
				});
		});
	});
};

module.exports = relationshipHelper;
