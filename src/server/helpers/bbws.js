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

var superagent = require('superagent');
var config = require('../helpers/config');

require('superagent-bluebird-promise');

var bbws = {};

var _processError = function(response) {
	var newErr;

	var requestPath = response.error.method + ' ' + response.error.path;

	if (response.status === 404) {
		newErr = new Error('WS path not found: ' + requestPath);
		newErr.status = 404;
	}
	else {
		newErr = new Error('There was an error accessing the web service');
		if (response.res) {
			console.log('WS error: ' + response.status + ' ' + requestPath + ' ' + JSON.stringify(response.res.request._data));
		}
		else {
			console.log('No response.');
		}
	}

	throw newErr;
};

var _execRequest = function(requestType, path, options) {
	if (path.charAt(0) === '/') {
		path = config.site.webservice + path;
	}

	var request = superagent[requestType](path)
		.accept('application/json');

	if (options.accessToken) {
		request = request.set('Authorization', 'Bearer ' + options.accessToken);
	}

	if (options.params) {
		request = request.query(options.params);
	}

	if (options.data) {
		request = request.send(options.data);
	}

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

bbws.del = function(path, data, options) {
	options = options || {};
	options.data = data || {};

	return _execRequest('del', path, options);
};

module.exports = bbws;
