var superagent = require('superagent');
var Promise = require('bluebird');
var config = require('../helpers/config');

require('superagent-bluebird-promise');

bbws = {};

var _processError = function(response) {
	var newErr;

	var requestPath = response.error.method + ' ' + response.error.path;

	if (response.status == 404) {
		newErr = new Error('WS path not found: ' + requestPath);
		newErr.status = 404;
	}
	else {
		newErr = new Error('There was an error accessing the web service');
		console.log('WS error: ' + response.status + ' ' + requestPath);
	}

	throw newErr;
};

var _execRequest = function(requestType, path, options) {
	if (path.charAt(0) === '/')
		path = config.site.webservice + path;

	var request = superagent[requestType](path)
		.accept('application/json');

	if (options.accessToken)
		request = request.set('Authorization', 'Bearer ' + options.accessToken);

	if (options.params)
		request = request.query(options.params);

	if (options.data)
		request = request.send(options.data);

	return request
		.promise()
		.then(function(response) {
			return response.body;
		})
		.catch(_processError);
};

bbws.get = function(path, options) {
	options = options || {};

	return _execRequest('get', path, options);
};

bbws.post = function(path, data, options) {
	options = options || {};
	options.data = data || {};

	return _execRequest('post', path, options);
};

bbws.put = function(path, data, options) {
	options = options || {};
	options.data = data || {};

	return _execRequest('put', path, options);
};

module.exports = bbws;
