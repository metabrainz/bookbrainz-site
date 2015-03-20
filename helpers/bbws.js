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

	if (options.authRequired && options.accessToken) {
		request = request.set('Authorization', 'Bearer ' + options.accessToken);
	}

	return request
		.promise()
		.then(function(response) {
			return response.body;
		});
};

module.exports = bbws;
