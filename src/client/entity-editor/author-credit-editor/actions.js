/*
 * Copyright (C) 2020  Sean Burke
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
/* eslint-disable no-console */

// @flow

export const ADD_AUTHOR_CREDIT_ROW = 'ADD_AUTHOR_CREDIT_ROW';
export const REMOVE_AUTHOR_CREDIT_ROW = 'REMOVE_AUTHOR_CREDIT_ROW';
export const UPDATE_CREDIT_AUTHOR_VALUE = 'UPDATE_CREDIT_AUTHOR_VALUE';
export const UPDATE_CREDIT_DISPLAY_VALUE = 'UPDATE_CREDIT_DISPLAY_VALUE';
export const UPDATE_CREDIT_JOIN_PHRASE_VALUE = 'UPDATE_CREDIT_JOIN_PHRASE_VALUE';

export type Action = {
	type: string,
	payload?: mixed
};

export type Author = {
	value: string,
	id: number
};

let nextAuthorCreditRowId = 0;

/**
 * Produces an action indicating that a row for an additional name should be
 * added to the author credit editor. The row is assigned an ID based on an
 * incrementing variable existing on the client.
 *
 * @returns {Action} The resulting ADD_AUTHOR_CREDIT_ROW action.
 */
export function addAuthorCreditRow(): Action {
	/*
	 * Prepend 'n' here to indicate a new row, and avoid conflicts with IDs of
	 * existing author credit rows.
	 */
	return {
		payload: `n${nextAuthorCreditRowId++}`,
		type: ADD_AUTHOR_CREDIT_ROW
	};
}

/**
 * Produces an action indicating that the row with the provided ID should be
 * removed from the author credit editor.
 *
 * @param {number} rowId - The ID for the row to be deleted.
 * @returns {Action} The resulting REMOVE_AUTHOR_CREDIT_ROW action.
 */
export function removeAuthorCreditRow(rowId: number): Action {
	return {
		payload: rowId,
		type: REMOVE_AUTHOR_CREDIT_ROW
	};
}

/**
 * Produces an action indicating that the author value for a particular name
 * within the editor should be updated with the provided value.
 *
 * @param {number} rowId - The ID of the row in the author credit editor to update.
 * @param {Author} newAuthor - The new value to be used for the author value.
 * @returns {Action} The resulting UPDATE_CREDIT_AUTHOR_VALUE action.
 */
export function updateCreditAuthorValue(
	rowId: number, newAuthor: Author
): Action {
	return {
		payload: {
			rowId,
			...newAuthor
		},
		type: UPDATE_CREDIT_AUTHOR_VALUE
	};
}

/**
 * Produces an action indicating that the display value for a particular name
 * within the editor should be updated with the provided value.
 *
 * @param {number} rowId - The ID of the row in the author credit editor to update.
 * @param {string} value - The new value to be used for the author display.
 * @returns {Action} The resulting UPDATE_CREDIT_DISPLAY_VALUE action.
 */
export function updateCreditDisplayValue(rowId: number, value: string): Action {
	return {
		payload: {
			rowId,
			value
		},
		type: UPDATE_CREDIT_DISPLAY_VALUE
	};
}

/**
 * Produces an action indicating that the join phrase value for a particular
 * name within the editor should be updated with the provided value.
 *
 * @param {number} rowId - The ID of the row in the author credit editor to update.
 * @param {string} value - The new value to be used for the join phrase.
 * @returns {Action} The resulting UPDATE_CREDIT_JOIN_PHRASE_VALUE action.
 */
export function updateCreditJoinPhraseValue(
	rowId: number, value: string
): Action {
	return {
		payload: {
			rowId,
			value
		},
		type: UPDATE_CREDIT_JOIN_PHRASE_VALUE
	};
}
