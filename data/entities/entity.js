var _ = require('underscore'),
    Model = rootRequire('helpers/model'),
    Creator = rootRequire('data/entities/creator'),
    Publication = rootRequire('data/entities/publication');

var Entity = new Model();

/* XXX: This is really gross and we need to find a better way of generically
 *      fetching entities given only a URI. */
Entity._fetchSingleResult = function(result, options) {
	if (!options || !options.path)
		return null;

	var promise = null;

	if (options.path.indexOf('creator') != -1) {
		promise = Creator._fetchSingleResult(result, options)
			.then(function(result) {
				return _.extend(result, { type: 'Creator' });
			});
	}
	else if (options.path.indexOf('publication') != -1) {
		promise = Publication._fetchSingleResult(result, options)
			.then(function(result) {
				return _.extend(result, { type: 'Publication' });
			});
	}

	return promise;
};

module.exports = Entity;
