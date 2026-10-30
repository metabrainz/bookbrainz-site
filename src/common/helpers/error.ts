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

import type {Response} from 'express';
import log from 'log';
import status from 'http-status';


type ErrorPath = {originalUrl?: string; path?: string};


/*
 * Marks the errors that were raised on purpose and may be shown to the user. Code that receives an error from another
 * copy of this module cannot rely on instanceof SiteError. The shared error handler recognizes this marker.
 */
export const SITE_ERROR_KIND = 'bookbrainz:site-error';

export class SiteError extends Error {
	status: number;

	readonly kind = SITE_ERROR_KIND;

	detailedMessage?: string | string[];

	constructor(message?: string | null) {
		super();

		/*
		 * We can't access the subclass's default message before calling super,
		 * so we set it manually here
		 */
		this.message = message || (this.constructor as typeof SiteError).defaultMessage;

		this.name = this.constructor.name;
		this.status = (this.constructor as typeof SiteError).status;
	}

	static get defaultMessage() {
		return 'An unhandled error occurred';
	}

	static get status(): number {
		return status.INTERNAL_SERVER_ERROR;
	}
}

class PathError extends SiteError {
	static detailedMessage(_req: ErrorPath): string[] { return []; }

	constructor(message: string | null | undefined, req: ErrorPath) {
		super(message);
		this.detailedMessage = (this.constructor as typeof PathError).detailedMessage(req);
	}
}

class _AuthenticationError extends SiteError {
	static get status(): number {
		return status.UNAUTHORIZED;
	}
}

export class AuthenticationFailedError extends _AuthenticationError {
	static get defaultMessage() {
		return 'Invalid authentication credentials';
	}
}

// For use when something slips past client-side validation
export class FormSubmissionError extends SiteError {
	static get defaultMessage() {
		return 'Form contained invalid data';
	}

	static get status(): number {
		return status.BAD_REQUEST;
	}
}

export class BadRequestError extends SiteError {
	static get defaultMessage() {
		return 'Bad Request';
	}

	static get status(): number {
		return status.BAD_REQUEST;
	}
}

export class NotAuthenticatedError extends _AuthenticationError {
	static get defaultMessage() {
		return 'You are not currently authenticated';
	}
}

export class NotFoundError extends PathError {
	static get defaultMessage() {
		return 'Page not found';
	}

	static get status(): number {
		return status.NOT_FOUND;
	}

	static detailedMessage(req: ErrorPath) {
		return [
			`No content exists at the path requested: ${req.originalUrl}`,
			'Please make sure you have entered in the correct address!'
		];
	}
}

export class PermissionDeniedError extends PathError {
	static get defaultMessage() {
		return 'You do not have permission to access this page';
	}

	static get status(): number {
		return status.FORBIDDEN;
	}

	static detailedMessage(req: ErrorPath) {
		return [
			`You do not have permission to access the following path:
			${req.path}`,
			`Please make sure you have entered in the correct credentials and
			address!`
		];
	}
}

export class NotAuthorizedError extends PathError {
	static get defaultMessage() {
		return 'You do not have permission to access this route';
	}

	static get status(): number {
		return status.FORBIDDEN;
	}

	static detailedMessage(req: ErrorPath) {
		return [
			`You do not have permission to access the following path:
			${req.originalUrl}`,
			'Please make sure you have the privileges to access the route!'
		];
	}
}

function _logError(err: unknown) {
	log.error(err);
}

function isSiteError(error: unknown): error is SiteError {
	return error instanceof Error && 'kind' in error && error.kind === SITE_ERROR_KIND &&
		'status' in error && typeof error.status === 'number';
}

export function getErrorToSend(err: unknown): SiteError {
	if (isSiteError(err)) {
		return err;
	}

	/*
	 * If we haven't generated the error ourselves with display in mind, log
	 * instead and return a new generic SiteError
	 */
	_logError(err);
	return new SiteError(err instanceof Error ? err.message : null);
}

export function sendErrorAsJSON(res: Response, err: unknown) {
	const errorToSend = getErrorToSend(err);

	res.status(
		errorToSend.status || status.INTERNAL_SERVER_ERROR
	).send({error: errorToSend.message});
}

export class AwardNotUnlockedError extends Error {
	constructor(message?: string) {
		super();

		/*
		 * We can't access the subclass's default message before calling super,
		 * so we set it manually here
		 */
		this.message = message || (this.constructor as typeof AwardNotUnlockedError).defaultMessage;

		this.name = this.constructor.name;
	}

	static get defaultMessage() {
		return 'An award was not unlocked';
	}
}

export class ConflictError extends SiteError {
	constructor(message?: string) {
		super();

		/*
		 * We can't access the subclass's default message before calling super,
		 * so we set it manually here
		 */
		this.message = message || (this.constructor as typeof SiteError).defaultMessage;

		this.name = this.constructor.name;
	}

	static get defaultMessage() {
		return 'Resource conflict';
	}

	static get status(): number {
		return status.CONFLICT;
	}
}

