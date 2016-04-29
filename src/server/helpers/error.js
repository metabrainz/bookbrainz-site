/*
 * Copyright (C) 2015-2016  Sean Burke
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

const status = require('http-status');

class SiteError extends Error {
	constructor(message) {
		super();

		// We can't access the subclass's default message before calling super,
		// so we set it manually here
		this.message = message || this.constructor.defaultMessage;

		this.name = this.constructor.name;
		this.status = this.constructor.status;
	}

	static get defaultMessage() {
		return 'An unhandled error occurred';
	}

	static get status() {
		return status.INTERNAL_SERVER_ERROR;
	}
}

class _AuthenticationError extends SiteError {
	static get status() {
		return status.UNAUTHORIZED;
	}
}

class AuthenticationFailedError extends _AuthenticationError {
	static get defaultMessage() {
		return 'Invalid authentication credentials';
	}
}

// For use when something slips past client-side validation
class FormSubmissionError extends SiteError {
	static get defaultMessage() {
		return 'Form contained invalid data';
	}
	
	static get status() {
		return status.BAD_REQUEST;
	}
}

class NotAuthenticatedError extends _AuthenticationError {
	static get defaultMessage() {
		return 'You are not currently authenticated';
	}
}

class NotFoundError extends SiteError {
	static get defaultMessage() {
		return 'Page not found';
	}

	static get status() {
		return status.NOT_FOUND;
	}
}

class PermissionDeniedError extends SiteError {
	static get defaultMessage() {
		return 'You do not have permission to access this page';
	}

	static get status() {
		return status.FORBIDDEN;
	}
}

function sendErrorAsJSON(res, err) {
	// If we have an error that we haven't handled in some better way, log it
	// so we have a record of what happened
	if (!err.status || err.status === status.INTERNAL_SERVER_ERROR) {
		console.log(err);
		console.log(err.stack);
	}

	res.status(err.status || status.INTERNAL_SERVER_ERROR).send({
		error: err.message
	});
}

const errors = {
	AuthenticationFailedError,
	FormSubmissionError,
	NotAuthenticatedError,
	NotFoundError,
	PermissionDeniedError,
	SiteError,
	sendErrorAsJSON
};

module.exports = errors;
