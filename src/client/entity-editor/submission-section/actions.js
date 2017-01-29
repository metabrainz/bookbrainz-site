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


export const SET_SUBMIT_ERROR = 'SET_SUBMIT_ERROR';
export const UPDATE_REVISION_NOTE = 'UPDATE_REVISION_NOTE';

/**
 * Produces an action indicating that the submit error for the editing form
 * should be updated with the provided value. This error is displayed in an
 * Alert if set, to indicate to the user what went wrong.
 *
 * @param {string} error - The error message to be set for the form.
 * @returns {Object} The resulting SET_SUBMIT_ERROR action.
 **/
export function setSubmitError(error) {
	return {
		type: SET_SUBMIT_ERROR,
		error
	};
}

/**
 * Produces an action indicating that the revision note for the editing form
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} value - The new value to be used for the revision note.
 * @returns {Object} The resulting UPDATE_REVISION_NOTE action.
 **/
export function debounceUpdateRevisionNote(value) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_REVISION_NOTE,
		value
	};
}
