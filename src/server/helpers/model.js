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

const bbws = require('./bbws');
const Promise = require('bluebird');
const _ = require('underscore');

const registered = [];

function Model(name, options) {
	if (!name || typeof name !== 'string') {
		throw new Error('Model must specify a name');
	}
	else if (registered[name]) {
		throw new Error('Model with this name already exists');
	}

	options = options || {};

	this.endpoint = options.endpoint || undefined;
	this.authRequired = options.authRequired || false;
	this.abstract = options.abstract || false;
	this.name = name;

	if (options.base) {
		const base = options.base;

		if (!(base instanceof Model)) {
			throw new TypeError('Specified base object is not a model');
		}

		this.fields = options.base.fields;
		base.children[this.name] = this;
	}

	this.fields = this.fields || {};
	this.children = {};

	registered[name] = this;
}

Model.prototype.extend = function(fields) {
	if (!fields || typeof fields !== 'object') {
		throw new TypeError('Model fields not an object');
	}

	if (_.isEmpty(fields) && _.isEmpty(this.fields)) {
		throw new Error('Model defined without any fields');
	}

	Object.keys(fields).forEach(function(fieldKey) {
		const field = fields[fieldKey];

		if (typeof field !== 'object') {
			throw new TypeError('Field ' + fieldKey + ' not an object');
		}

		if (!field.type) {
			throw new Error('No type specified for field ' + fieldKey);
		}

		/* XXX: Do type-specific sanity checks on field attributes. */
	});

	this.fields = _.extend(this.fields, fields);
};

Model.prototype._fetchSingleResult = function(result, options) {
	let model = this;
	const object = {};

	if (this.abstract) {
		if (!this.children[result._type]) {
			throw new Error('Model has no child with name ' + result._type);
		}

		model = this.children[result._type];
		object._type = result._type;
	}

	if (options.populate && !Array.isArray(options.populate)) {
		options.populate = [options.populate];
	}

	if (_.isEmpty(result)) {
		return null;
	}

	Object.keys(model.fields).forEach(function(key) {
		const field = model.fields[key];

		const resultsField = field.map || key;

		/* XXX: Validate return data by field type. */
		if (field.type !== 'ref') {
			object[key] = result[resultsField];
		}
		else {
			if (!_.contains(options.populate, key)) {
				object[key] = null;
				return;
			}

			if (!field.model || !registered[field.model]) {
				throw new Error('Reference field model is not defined');
			}

			const uri = result[resultsField];

			if (!uri) {
				return;
			}

			/* Choose function to call based on whether we expect a list. */
			const findFunc = field.many ? 'find' : 'findOne';

			object[key] = registered[field.model][findFunc]({
				path: uri,
				session: options.session
			});
		}
	});

	return Promise.props(object);
};

Model.prototype.find = function(options) {
	const self = this;
	options = options || {};

	let path;

	if (!options.path) {
		if (this.endpoint === undefined) {
			return Promise.reject(new Error('Model has no endpoint and path is unspecified'));
		}

		path = '/' + this.endpoint + '/';
	}
	else {
		path = options.path;
	}

	return bbws.get(path, {
		accessToken: options.accessToken,
		params: options.params
	})
		.then(function(result) {
			if (!Array.isArray(result.objects)) {
				throw new Error('Array expected, but received object');
			}

			const promises = [];

			result.objects.forEach(function(object) {
				promises.push(self._fetchSingleResult(object, options));
			});

			return Promise.all(promises);
		});
};

Model.prototype.findOne = function(id, options) {
	const self = this;

	/* Switch out options with ID if ID is not specified. */
	if (typeof id === 'object') {
		options = id;
		id = null;
	}

	options = options || {};

	let path;

	if (!options.path) {
		if (this.endpoint === undefined) {
			return Promise.reject(new Error('Model has no endpoint and path is unspecified'));
		}

		path = '/' + this.endpoint + '/';

		if (!id) {
			return Promise.reject(new Error('No object ID or absolute path specified'));
		}

		path += id + '/';
	}
	else {
		path = options.path;
	}

	return bbws.get(path, {
		accessToken: options.accessToken,
		params: options.params
	})
		.then(function(result) {
			if (result.objects && Array.isArray(result.objects)) {
				throw new Error('Object expected, but received array');
			}

			return self._fetchSingleResult(result, options);
		});
};

Model.prototype.create = function(data, options) {
	options = options || {};

	if (this.abstract) {
		return Promise.reject(new Error('Cannot create new instance of abstract class'));
	}

	if (this.endpoint === undefined) {
		return Promise.reject(new Error('Model has no endpoint'));
	}

	const path = '/' + this.endpoint + '/';
	const wsOptions = {};
	const object = {};

	if (options.session && options.session.bearerToken) {
		wsOptions.accessToken = options.session.bearerToken;
	}

	Object.keys(this.fields).forEach(function(key) {
		object[key] = data[key];
	});

	return bbws.post(path, object, wsOptions);
};

Model.prototype.update = function(id, data, options) {
	options = options || {};

	if (this.abstract) {
		return Promise.reject(new Error('Cannot update instance of abstract class'));
	}

	if (this.endpoint === undefined) {
		return Promise.reject(new Error('Model has no endpoint'));
	}

	const path = '/' + this.endpoint + '/' + id + '/';
	const wsOptions = {};
	const object = {};

	if (options.session && options.session.bearerToken) {
		wsOptions.accessToken = options.session.bearerToken;
	}

	Object.keys(this.fields).forEach(function(key) {
		object[key] = data[key];
	});

	return bbws.put(path, object, wsOptions);
};

Model.prototype.del = function(id, data, options) {
	options = options || {};

	if (this.abstract) {
		return Promise.reject(new Error('Cannot delete instance of abstract class'));
	}

	if (this.endpoint === undefined) {
		return Promise.reject(new Error('Model has no endpoint'));
	}

	const path = '/' + this.endpoint + '/' + id + '/';
	const wsOptions = {};
	const object = {};

	if (options.session && options.session.bearerToken) {
		wsOptions.accessToken = options.session.bearerToken;
	}

	Object.keys(this.fields).forEach(function(key) {
		object[key] = data[key];
	});

	return bbws.del(path, object, wsOptions);
};

module.exports = Model;
