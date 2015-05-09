var Promise = require('bluebird');

var CreatorType = require('../data/properties/creator-type');
var EditionStatus = require('../data/properties/edition-status');
var Entity = require('../data/entity');
var Gender = require('../data/properties/gender');
var Language = require('../data/properties/language');
var PublicationType = require('../data/properties/publication-type');
var PublisherType = require('../data/properties/publisher-type');
var WorkType = require('../data/properties/work-type');
var IdentifierType = require('../data/properties/identifier-type');

var renderRelationship = require('../helpers/render');

var NotFoundError = require('../helpers/error').NotFoundError;

var makeLoader = function(model, propName, sortFunc) {
	return function(req, res, next) {
		model.find()
			.then(function(results) {
				if (sortFunc)
					results = results.sort(sortFunc);

				res.locals[propName] = results;
				next();
			})
			.catch(next);
	};
};

var middleware = {};

middleware.loadCreatorTypes = makeLoader(CreatorType, 'creatorTypes');
middleware.loadPublicationTypes = makeLoader(PublicationType, 'publicationTypes');
middleware.loadEditionStatuses = makeLoader(EditionStatus, 'editionStatuses');
middleware.loadPublisherTypes = makeLoader(PublisherType, 'publisherTypes');
middleware.loadWorkTypes = makeLoader(WorkType, 'workTypes');
middleware.loadIdentifierTypes = makeLoader(IdentifierType, 'identifierTypes');

middleware.loadGenders = makeLoader(Gender, 'genders', function(a, b) {
	return a.id > b.id;
});

middleware.loadLanguages = makeLoader(Language, 'languages', function(a, b) {
	if (a.frequency !== b.frequency)
		return b.frequency - a.frequency;

	return a.name.localeCompare(b.name);
});

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

middleware.makeEntityLoader = function(model, errMessage) {
	return function(req, res, next, bbid) {
		if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(bbid)) {
			var populate = [
				'annotation',
				'disambiguation',
				'relationships',
				'aliases',
				'identifiers'
			];

			// XXX: Don't special case this; instead, let the route specify
			if (model.name === 'Edition') {
				populate.push('publication');
			}

			model.findOne(req.params.bbid, {
					populate: populate
				})
				.then(function(entity) {
					res.locals.entity = entity;

					next();
				})
				.catch(function(err) {
					if (err.status == 404) {
						var newErr = new NotFoundError(errMessage);
						return next(newErr);
					}

					next(err);
				});
		}
		else {
			next('route');
		}
	};
};

module.exports = middleware;
