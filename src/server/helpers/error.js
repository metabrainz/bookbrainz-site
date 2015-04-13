var util = require('util');

var NotFoundError = function(message) {
	NotFoundError.super_.call(this);

	this.message = message || 'Object not found';
	this.status = 404;
};

util.inherits(NotFoundError, Error);

var errors = {
	NotFoundError: NotFoundError
};

module.exports = errors;
