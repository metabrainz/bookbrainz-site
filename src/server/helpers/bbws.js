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

const superagent = require('superagent');
const config = require('../helpers/config');
const status = require('http-status');

require('superagent-bluebird-promise');

const bbws = {};

function _processError(err) {
	let newErr;
	let requestPath = '';

	const response = err.res;

	if (response) {
		requestPath = `${response.error.method} ${response.error.path}`;
	}

	if (response && response.status === status.NOT_FOUND) {
		newErr = new Error(`WS path not found: ${requestPath}`);
		newErr.status = status.NOT_FOUND;
	}
	else {
		newErr = new Error('There was an error accessing the web service');
		if (response) {
			console.log(
				`WS error: ${response.status} ${requestPath} ` +
				`${JSON.stringify(response.request._data)}`
			);
		}
		else {
			console.log('No response.');
		}
	}

	throw newErr;
}

function _execRequest(requestType, path, options) {
	const absPath =
		(path.charAt(0) === '/' ? config.site.webservice : '') + path;

	let request = superagent[requestType](absPath)
		.accept('application/json');

	if (options.accessToken) {
		request = request.set(
			'Authorization', `Bearer ${options.accessToken}`
		);
	}

	if (options.params) {
		request = request.query(options.params);
	}

	if (options.data) {
		request = request.send(options.data);
	}

	return request
		.promise()
		.then((response) => response.body)
		.catch(_processError);
}

bbws.get = function get(path, options) {
	return _execRequest('get', path, options || {});
};

bbws.post = function post(path, data, baseOptions) {
	const options = baseOptions || {};
	options.data = data || {};

	return _execRequest('post', path, options);
};

bbws.put = function put(path, data, baseOptions) {
	const options = baseOptions || {};
	options.data = data || {};

	return _execRequest('put', path, options);
};

bbws.del = function del(path, data, baseOptions) {
	const options = baseOptions || {};
	options.data = data || {};

	return _execRequest('del', path, options);
};

module.exports = bbws;
