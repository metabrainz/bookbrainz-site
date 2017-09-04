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

export const UPDATE_GENDER = 'UPDATE_GENDER';
export const UPDATE_TYPE = 'UPDATE_TYPE';
export const UPDATE_BEGIN_DATE = 'UPDATE_BEGIN_DATE';
export const UPDATE_END_DATE = 'UPDATE_END_DATE';
export const UPDATE_ENDED = 'UPDATE_ENDED';

export type Action = {
	type: string,
	payload?: mixed,
	metadata?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the gender for the creator being edited
 * should be updated with the provided value.
 *
 * @param {number} newGenderId - The new value to be used for the gender ID.
 * @returns {Action} The resulting UPDATE_GENDER action.
 **/
export function updateGender(newGenderId: ?number): Action {
	return {
		payload: newGenderId,
		type: UPDATE_GENDER
	};
}

/**
 * Produces an action indicating that the creator type for the creator being
 * edited should be updated with the provided value.
 *
 * @param {number} newTypeId - The new value to be used for the creator type ID.
 * @returns {Action} The resulting UPDATE_TYPE action.
 **/
export function updateType(newTypeId: ?number): Action {
	return {
		payload: newTypeId,
		type: UPDATE_TYPE
	};
}

/**
 * Produces an action indicating that the begin date for the creator being
 * edited should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newBeginDate - The new value to be used for the begin date.
 * @returns {Action} The resulting UPDATE_BEGIN_DATE action.
 **/
export function debouncedUpdateBeginDate(newBeginDate: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newBeginDate,
		type: UPDATE_BEGIN_DATE
	};
}

/**
 * Produces an action indicating that the end date for the creator being
 * edited should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newEndDate - The new value to be used for the end date.
 * @returns {Action} The resulting UPDATE_END_DATE action.
 **/
export function debouncedUpdateEndDate(newEndDate: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newEndDate,
		type: UPDATE_END_DATE
	};
}

/**
 * Produces an action indicating that the ended flag for the creator being
 * edited should be updated with the provided value.
 *
 * @param {boolean} newEnded - The new value to be used for the ended flag.
 * @returns {Action} The resulting UPDATE_ENDED action.
 **/
export function updateEnded(newEnded: boolean): Action {
	return {
		payload: newEnded,
		type: UPDATE_ENDED
	};
}
