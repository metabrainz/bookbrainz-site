/*
 * Copyright (C) 2016  Ben Ockmore
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

// @flow

import type {Map} from 'immutable';
import _ from 'lodash';
import request from 'superagent';


export const SET_SUBMIT_ERROR = 'SET_SUBMIT_ERROR';
export const UPDATE_REVISION_NOTE = 'UPDATE_REVISION_NOTE';

export type Action = {
	type: string,
	payload?: mixed,
	metadata?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the submit error for the editing form
 * should be updated with the provided value. This error is displayed in an
 * Alert if set, to indicate to the user what went wrong.
 *
 * @param {string} error - The error message to be set for the form.
 * @returns {Action} The resulting SET_SUBMIT_ERROR action.
 */
export function setSubmitError(error: string): Action {
	return {
		error,
		type: SET_SUBMIT_ERROR
	};
}

/**
 * Produces an action indicating that the revision note for the editing form
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} value - The new value to be used for the revision note.
 * @returns {Action} The resulting UPDATE_REVISION_NOTE action.
 */
export function debounceUpdateRevisionNote(value: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_REVISION_NOTE,
		value
	};
}

type Response = {
	body: {
		bbid: string,
		alert?: string
	}
};

function postSubmission(url: string, data: Map<string, mixed>): Promise {
	/*
	 * TODO: Not the best way to do this, but once we unify the
	 * /<entity>/create/handler and /<entity>/edit/handler URLs, we can simply
	 * pass the entity type and generate both URLs from that.
	 */

	const [, submissionEntity] = url.split('/');
	return request.post(url).send(Object.fromEntries(data))
		.then((response: Response) => {
			if (!response.body) {
				window.location.replace('/login');
			}

			const redirectUrl = `/${submissionEntity}/${response.body.bbid}`;
			if (response.body.alert) {
				const alertParam = `?alert=${response.body.alert}`;
				window.location.href = `${redirectUrl}${alertParam}`;
			}
			else {
				window.location.href = redirectUrl;
			}
		});
}

export function submit(
	submissionUrl: string
): ((Action) => mixed, () => Map<string, mixed>) => mixed {
	return (dispatch, getState) => {
		const rootState = getState();
		return postSubmission(submissionUrl, rootState)
			.catch(
				(error: {message: string}) => {
					/*
					 * Use server-set message first, otherwise internal
					 * superagent message
					 */
					const message =
						_.get(error, ['res', 'body', 'error'], null) ||
						error.message;
					return dispatch(setSubmitError(message));
				}
			);
	};
}
