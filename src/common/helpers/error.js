/*
 * Copyright (C) 2015-2016  Sean Burke
 *
 * Licensed under GNU GPL v2 or later.
 * This software is distributed without warranty.
 */

import log from 'log';
import status from 'http-status';


/**
 * Base error class for all application-specific errors.
 * Provides a consistent structure for message, name, and HTTP status code.
 */
export class SiteError extends Error {
	constructor(message) {
		super();

		// Assign custom message or fallback to default message defined in subclass
		this.message = message || this.constructor.defaultMessage;

		// Set error name dynamically based on class name
		this.name = this.constructor.name;

		// Assign HTTP status code associated with this error
		this.status = this.constructor.status;
	}

	// Default error message (can be overridden in subclasses)
	static get defaultMessage() {
		return 'An unhandled error occurred';
	}

	// Default HTTP status (500 Internal Server Error)
	static get status() {
		return status.INTERNAL_SERVER_ERROR;
	}
}


/**
 * Error class for path-related issues (e.g., invalid URLs).
 * Supports optional detailed messages based on request context.
 */
class PathError extends SiteError {
	constructor(message, req) {
		super(message);

		// Generate detailed message using request data if defined
		this.detailedMessage = this.constructor.detailedMessage &&
				this.constructor.detailedMessage(req);
	}
}


/**
 * Base class for authentication-related errors.
 */
class _AuthenticationError extends SiteError {
	static get status() {
		return status.UNAUTHORIZED;
	}
}


/**
 * Thrown when authentication credentials are invalid.
 */
export class AuthenticationFailedError extends _AuthenticationError {
	static get defaultMessage() {
		return 'Invalid authentication credentials';
	}
}


/**
 * Used when server-side validation fails after form submission.
 */
export class FormSubmissionError extends SiteError {
	static get defaultMessage() {
		return 'Form contained invalid data';
	}

	static get status() {
		return status.BAD_REQUEST;
	}
}


/**
 * Generic error for malformed or invalid client requests.
 */
export class BadRequestError extends SiteError {
	static get defaultMessage() {
		return 'Bad Request';
	}

	static get status() {
		return status.BAD_REQUEST;
	}
}


/**
 * Thrown when user is not authenticated but tries to access protected resource.
 */
export class NotAuthenticatedError extends _AuthenticationError {
	static get defaultMessage() {
		return 'You are not currently authenticated';
	}
}


/**
 * Error for resources/pages that do not exist.
 */
export class NotFoundError extends PathError {
	static get defaultMessage() {
		return 'Page not found';
	}

	static get status() {
		return status.NOT_FOUND;
	}

	// Provide additional debugging info for missing routes
	static detailedMessage(req) {
		return [
			`No content exists at the path requested: ${req.originalUrl}`,
			'Please make sure you have entered in the correct address!'
		];
	}
}


/**
 * Error when user lacks permission for a specific page/resource.
 */
export class PermissionDeniedError extends PathError {
	static get defaultMessage() {
		return 'You do not have permission to access this page';
	}

	static get status() {
		return status.FORBIDDEN;
	}

	static detailedMessage(req) {
		return [
			`You do not have permission to access the following path:
			${req.path}`,
			`Please make sure you have entered the correct credentials and address!`
		];
	}
}


/**
 * Error when user is authenticated but not authorized for a specific route.
 */
export class NotAuthorizedError extends PathError {
	static get defaultMessage() {
		return 'You do not have permission to access this route';
	}

	static get status() {
		return status.FORBIDDEN;
	}

	static detailedMessage(req) {
		return [
			`You do not have permission to access the following path:
			${req.originalUrl}`,
			'Please make sure you have the privileges to access the route!'
		];
	}
}


/**
 * Internal helper to log unexpected errors.
 */
function _logError(err) {
	log.error(err);
}


/**
 * Converts unknown errors into a safe, user-facing SiteError.
 * Logs original error if it's not already a SiteError.
 */
export function getErrorToSend(err) {
	if (err instanceof SiteError) {
		return err;
	}

	// Log unexpected errors and return a generic safe error
	_logError(err);
	return new SiteError(err.message);
}


/**
 * Sends error response in JSON format to client.
 */
export function sendErrorAsJSON(res, err) {
	const errorToSend = getErrorToSend(err);

	res.status(
		errorToSend.status || status.INTERNAL_SERVER_ERROR
	).send({error: errorToSend.message});
}


/**
 * Error for cases where a user attempts to access a locked award.
 */
export class AwardNotUnlockedError extends Error {
	constructor(message) {
		super();

		// Assign message or fallback to default
		this.message = message || this.constructor.defaultMessage;

		this.name = this.constructor.name;
	}

	static get defaultMessage() {
		return 'An award was not unlocked';
	}
}


/**
 * Error for resource conflicts (e.g., duplicate entries).
 */
export class ConflictError extends SiteError {
	constructor(message) {
		super();

		// Assign message or fallback to default
		this.message = message || this.constructor.defaultMessage;

		this.name = this.constructor.name;
	}

	static get defaultMessage() {
		return 'Resource conflict';
	}

	static get status() {
		return status.CONFLICT;
	}
}
