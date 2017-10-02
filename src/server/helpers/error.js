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

import * as propHelpers from './props';
import ErrorPage from '../../client/components/pages/error';
import Layout from '../../client/containers/layout';
import Log from 'log';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import config from './config';
import statusCodes from 'http-status';


const log = new Log(config.site.log);

export class SiteError extends Error {
	constructor({
		message = 'An unhandled error occured',
		name = null,
		status = statusCodes.INTERNAL_SERVER_ERROR
	} = {}) {
		super();

		this.message = message;
		this.name = name;
		this.status = status;
	}
}

class PathError extends SiteError {
	constructor({
		detailedMessage,
		...props
	}) {
		super(props);
		this.detailedMessage = detailedMessage;
	}
}

class _AuthenticationError extends SiteError {
	constructor(props) {
		super({status: statusCodes.UNAUTHORIZED, ...props});
	}
}

export class AuthenticationFailedError extends _AuthenticationError {
	constructor(props) {
		super({defaultMessage: 'Invalid authentication credentials', ...props});
	}
}

// For use when something slips past client-side validation
export class FormSubmissionError extends SiteError {
	constructor(props) {
		super({
			defaultMessage: 'Form contained invalid data',
			status: statusCodes.BAD_REQUEST,
			...props
		});
	}
}

export class NotAuthenticatedError extends _AuthenticationError {
	constructor(props) {
		super({
			defaultMessage: 'You are not currently authenticated',
			...props
		});
	}
}

export class NotFoundError extends PathError {
	constructor({req = {path: 'N/A'}, ...rest}) {
		const detailedMessage = [
			`No content exists at the path requested: ${req.path}`,
			'Please make sure you have entered in the correct address!'
		];

		super({
			defaultMessage: 'Page not found',
			detailedMessage,
			status: statusCodes.NOT_FOUND,
			...rest
		});
	}
}

export class PermissionDeniedError extends PathError {
	constructor({req = {path: 'N/A'}, ...rest}) {
		const detailedMessage = [
			`You do not have permission to access the following path:
			${req.path}`,
			`Please make sure you have entered in the correct credentials and
			address!`
		];

		super({
			defaultMessage: 'You do not have permission to access this page',
			detailedMessage,
			status: statusCodes.FORBIDDEN,
			...rest
		});
	}
}


export class AwardNotUnlockedError extends SiteError {
	constructor(props) {
		super({
			defaultMessage: 'An award was not unlocked',
			...props
		});
	}
}


function _logError(err) {
	log.error(err);
	log.debug(err.stack);
}

function _getErrorToSend(err) {
	if (err instanceof SiteError) {
		return err;
	}

	// If we haven't generated the error ourselves with display in mind, log
	// instead and return a new generic SiteError
	_logError(err);
	return new SiteError();
}

export function renderError(req, res, err) {
	const errorToSend = _getErrorToSend(err);
	const props = propHelpers.generateProps(req, res, {
		error: errorToSend
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<ErrorPage
				error={props.error}
			/>
		</Layout>
	);
	res.status(errorToSend.status).render('target', {markup});
}

export function sendErrorAsJSON(res, err) {
	const errorToSend = _getErrorToSend(err);

	res.status(errorToSend.status).send({error: errorToSend.message});
}
