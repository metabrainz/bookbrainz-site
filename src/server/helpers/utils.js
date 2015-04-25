var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

function getEntityLink(entity) {
	return '/' + entity._type.toLowerCase() + '/' + entity.entity_gid;
}

// Returns a Promise which fulfills with an entity with aliases and data.
function getEntity(ws, entityGid, fetchOptions) {
	var entityPromise = request.get(ws + '/entity/' + entityGid).promise()
		.then(function(entityResponse) {
			return entityResponse.body;
		});

	return entityPromise.then(function(entity) {
		if (fetchOptions.data) {
			entity.data = request.get(entity.data_uri).promise()
				.then(function(dataResponse) {
					return dataResponse.body;
				});
		}

		if (fetchOptions.aliases) {
			entity.aliases = request.get(entity.aliases_uri).promise()
				.then(function(aliasesResponse) {
					return aliasesResponse.body;
				});
		}

		if (fetchOptions.annotation) {
			entity.annotation = request.get(entity.annotation_uri).promise()
				.then(function(annotationResponse) {
					return annotationResponse.body;
				});
		}

		if (fetchOptions.disambiguation) {
			entity.disambiguation = request.get(entity.disambiguation_uri).promise()
				.then(function(disambiguationResponse) {
					return disambiguationResponse.body;
				});
		}

		if (fetchOptions.relationships) {
			entity.relationships = request.get(entity.relationships_uri).promise()
				.then(function(relationshipsResponse) {
					return relationshipsResponse.body;
				});
		}

		return Promise.props(entity);
	});
}

module.exports = {
	getEntityLink: getEntityLink,
	getEntity: getEntity
};
