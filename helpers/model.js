var bbws = require('./bbws'),
    Promise = require('bluebird'),
    _ = require('underscore');

function Model(options) {
	options = options || {};

	this.endpoint = options.endpoint || undefined;
	this.authRequired = options.authRequired || false;

	this.fields = this.fields || {};
};

Model.prototype._getAuthOptions = function(session) {
	var accessToken = (session && session.bearerToken) ? session.bearerToken : null;

	var options = {
		authRequired: this.authRequired,
		accessToken: accessToken
	};

	return options;
};

Model.prototype.extend = function(fields) {
	if (!fields || typeof fields !== 'object')
		throw new TypeError('Model fields not an object');

	if (_.isEmpty(fields) && _.isEmpty(this.fields))
		throw new Error('Model defined without any fields');

	Object.keys(fields).forEach(function(fieldKey) {
		var field = fields[fieldKey];

		if (typeof field !== 'object')
			throw new TypeError('Field ' + fieldKey + ' not an object');

		if (!field.type)
			throw new Error('No type specified for field ' + fieldKey);

		/* XXX: Do type-specific sanity checks on field attributes. */
	});

	this.fields = _.extend(this.fields, fields);
};

Model.prototype._fetchSingleResult = function(result, populate, session) {
	var self = this;
	var object = {};

	Object.keys(this.fields).forEach(function(key) {
		var field = self.fields[key];

		var resultsField = field.map || key;

		/* XXX: Validate return data by field type. */
		if (field.type !== 'ref') {
			object[key] = result[resultsField];
		}
		else {
			if (!_.contains(populate, key)) {
				object[key] = null;
				return;
			}

			if (!field.model)
				throw new Error('Reference field model is not defined');

			var uri = result[resultsField];

			/* Choose function to call based on whether we expect a list. */
			var findFunc = field.many ? 'find' : 'findOne';

			object[key] = field.model[findFunc]({
				path: uri,
				session: session
			});
		}
	});

	return Promise.props(object);
};

Model.prototype.find = function(options) {
	var self = this;
	options = options || {};

	var path;

	if (!options.path) {
		if (this.endpoint === undefined)
			return Promise.reject(new Error('Model has no endpoint and path is unspecified'));

		path = '/' + this.endpoint;
	}
	else {
		/* An absolute path has been specified. */
		path = options.path;
	}

	var wsOptions = this._getAuthOptions(options.session);

	return bbws.get(path, wsOptions)
		.then(function(result) {
				if (options.populate && !Array.isArray(options.populate)) {
					options.populate = [ options.populate ];
				}

				if (!Array.isArray(result.objects))
					throw new Error('Array expected, but received object');

				var promises = [];

				result.objects.forEach(function(object) {
					promises.push(self._fetchSingleResult(object, options.populate, options.session));
				});

				return Promise.all(promises);
			});
};

Model.prototype.findOne = function(id, options) {
	var self = this;

	/* Allow not specifying an ID if the path is absolute. */
	if (typeof id === 'object') {
		options = id;
		id = null;
	}

	options = options || {};

	var path;

	if (!options.path) {
		if (this.endpoint === undefined)
			return Promise.reject(new Error('Model has no endpoint and path is unspecified'));

		path = '/' + this.endpoint;

		if (!id)
			return Promise.reject(new Error('No object ID or absolute path specified'));

		path += '/' + id;
	}
	else {
		/* An absolute path has been specified. */
		path = options.path;
	}

	var wsOptions = this._getAuthOptions(options.session);

	return bbws.get(path, wsOptions)
		.then(function(result) {
				if (options.populate && !Array.isArray(options.populate)) {
					options.populate = [ options.populate ];
				}

				if (result.objects && Array.isArray(result.objects))
					throw new Error('Object expected, but received array');

				return self._fetchSingleResult(result, options.populate, options.session);
			});
};

Model.prototype.create = function(data, options) {
	var self = this;
	options = options || {};

	if (this.endpoint === undefined)
		return Promise.reject(new Error('Model has no endpoint'));

	var path = '/' + this.endpoint + '/';
	var wsOptions = this._getAuthOptions(options.session);
	var object = {};

	Object.keys(this.fields).forEach(function(key) {
		var field = self.fields[key];

		object[key] = data[key];
	});

	return bbws.post(path, object, wsOptions);
};

module.exports = Model;
