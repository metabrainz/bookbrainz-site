var Promise = require('bluebird');
var _ = require('underscore');

var CreatorType = require('../data/properties/creator-type');
var Entity = require('../data/entity');
var Gender = require('../data/properties/gender');
var Language = require('../data/properties/language');

var renderRelationship = require('../helpers/render');

var middleware = {};

middleware.loadCreatorTypes = function(req, res, next) {
	CreatorType.find()
		.then(function(creatorTypes) {
			res.locals.creatorTypes = creatorTypes;

			next();
		})
		.catch(next);
};

middleware.loadGenders = function(req, res, next) {
	Gender.find()
		.then(function(genders) {
			res.locals.genders = genders.sort(function(a, b) {
				return a.id > b.id;
			});

			next();
		})
		.catch(next);
};

middleware.loadLanguages = function(req, res, next) {
	Language.find()
		.then(function(languages) {
			res.locals.languages = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return b.frequency - a.frequency;

				return a.name.localeCompare(b.name);
			});

			next();
		})
		.catch(next);
};

middleware.loadEntityRelationships = function(req, res, next) {
	if (!res.locals.entity)
		next(new Error('Entity failed to load'));

	var entity = res.locals.entity;
	Promise.map(entity.relationships, function(relationship) {
		relationship.template = relationship.relationship_type.template;

		var entities = relationship.entities.sort(function sortRelationshipEntity(a, b) {
			return a.position - b.position;
		});

		return Promise.map(entities, function(entity) {
			return Entity.findOne(entity.entity.entity_gid);
		})
			.then(function(entities) {
				relationship.rendered = renderRelationship(entities, relationship, null);

				return relationship;
			});
	})
		.then(function(relationships) {
			res.locals.entity.relationships = relationships;

			next();
		})
		.catch(next);
};

module.exports = middleware;
