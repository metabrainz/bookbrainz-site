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

import * as propHelpers from '../../client/helpers/props';
import ErrorPage from '../../client/components/pages/error';
import Layout from '../../client/containers/layout';
import Log from 'log';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import config from './config';
import {generateProps} from './props';
import status from 'http-status';
import target from '../templates/target';


const log = new Log(config.site.log);

export class SiteError extends Error {
	constructor(message) {
		super();

		/*
		 * We can't access the subclass's default message before calling super,
		 * so we set it manually here
		 */
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

class PathError extends SiteError {
	constructor(message, req) {
		super(message);
		this.detailedMessage = this.constructor.detailedMessage &&
				this.constructor.detailedMessage(req);
	}
}

class _AuthenticationError extends SiteError {
	static get status() {
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

	static get status() {
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

	static get status() {
		return status.NOT_FOUND;
	}

	static detailedMessage(req) {
		return [
			`No content exists at the path requested: ${req.path}`,
			'Please make sure you have entered in the correct address!'
		];
	}
}

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
			`Please make sure you have entered in the correct credentials and
			address!`
		];
	}
}

function _logError(err) {
	log.error(err);
}

function _getErrorToSend(err) {
	if (err instanceof SiteError) {
		return err;
	}

	/*
	 * If we haven't generated the error ourselves with display in mind, log
	 * instead and return a new generic SiteError
	 */
	_logError(err);
	return new SiteError();
}

export function renderError(req, res, err) {
	const errorToSend = _getErrorToSend(err);
	const props = generateProps(req, res, {
		error: errorToSend
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<ErrorPage
				error={props.error}
			/>
		</Layout>
	);
	res.status(
		errorToSend.status || status.INTERNAL_SERVER_ERROR
	).send(target({markup}));
}

export function sendErrorAsJSON(res, err) {
	const errorToSend = _getErrorToSend(err);

	res.status(
		errorToSend.status || status.INTERNAL_SERVER_ERROR
	).send({error: errorToSend.message});
}

export class AwardNotUnlockedError extends Error {
	constructor(message) {
		super();

		/*
		 * We can't access the subclass's default message before calling super,
		 * so we set it manually here
		 */
		this.message = message || this.constructor.defaultMessage;

		this.name = this.constructor.name;
	}

	static get defaultMessage() {
		return 'An award was not unlocked';
	}
}
