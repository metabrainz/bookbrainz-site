var superagent = require('superagent'),
    Promise = require('bluebird'),
    config = rootRequire('helpers/config');

require('superagent-bluebird-promise');

bbws = {};

bbws.get = function(path, options) {
	options = options || {};

	if (path.charAt(0) === '/')
		path = config.site.webservice + path;

	var request = superagent.get(path)
		.accept('application/json');

	return request
		.promise()
		.then(function(response) {
			return response.body;
		});
};

bbws.post = function(path, data, options) {
	options = options || {};

	if (path.charAt(0) === '/')
		path = config.site.webservice + path;

	if (!options.accessToken)
		return Promise.reject(new Error('User is not authenticated'));

	return superagent.post(path)
		.set('Authorization', 'Bearer ' + options.accessToken)
		.send(data)
		.promise()
		.then(function(response) {
			return response.body;
		});
};

module.exports = bbws;
