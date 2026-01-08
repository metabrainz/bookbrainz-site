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


export const ADD_AUTHOR_CREDIT_ROW = 'ADD_AUTHOR_CREDIT_ROW';
export const REMOVE_AUTHOR_CREDIT_ROW = 'REMOVE_AUTHOR_CREDIT_ROW';
export const UPDATE_CREDIT_AUTHOR_VALUE = 'UPDATE_CREDIT_AUTHOR_VALUE';
export const UPDATE_CREDIT_DISPLAY_VALUE = 'UPDATE_CREDIT_DISPLAY_VALUE';
export const UPDATE_CREDIT_JOIN_PHRASE_VALUE = 'UPDATE_CREDIT_JOIN_PHRASE_VALUE';
export const SHOW_AUTHOR_CREDIT_EDITOR = 'SHOW_AUTHOR_CREDIT_EDITOR';
export const HIDE_AUTHOR_CREDIT_EDITOR = 'HIDE_AUTHOR_CREDIT_EDITOR';
export const REMOVE_EMPTY_CREDIT_ROWS = 'REMOVE_EMPTY_CREDIT_ROWS';
export const UPDATE_AUTHOR_CREDIT = 'UPDATE_AUTHOR_CREDIT';
export const CLEAR_AUTHOR_CREDIT = 'CLEAR_AUTHOR_CREDIT';
export const RESET_AUTHOR_CREDIT = 'RESET_AUTHOR_CREDIT';
export const TOGGLE_AUTHOR_CREDIT = 'TOGGLE_AUTHOR_CREDIT';

export type Action = {
	type: string,
	payload?: unknown
};

export type Author = {
	value: string,
	id: number
};

export type AuthorCreditRow = {
	name: string,
	joinPhrase: string,
	author: Author,
	authorBBID: string,
	position: number,
	authorCreditID: number
};
export type AuthorCredit = {
	authorCount: number,
	beginPhrase: string,
	names: Array<Map<string, AuthorCreditRow>>,
	id: number,
};

let nextAuthorCreditRowId = 1;

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

/**
 * Produces an action indicating that the Author Credit editor popup should be shown
 *
 * @returns {Action} The resulting SHOW_AUTHOR_CREDIT_EDITOR action.
 */
export function showAuthorCreditEditor(): Action {
	return {
		type: SHOW_AUTHOR_CREDIT_EDITOR
	};
}

/**
 * Produces an action indicating that the Author Credit editor popup should be hidden
 *
 * @returns {Action} The resulting HIDE_AUTHOR_CREDIT_EDITOR action.
 */
export function hideAuthorCreditEditor(): Action {
	return {
		type: HIDE_AUTHOR_CREDIT_EDITOR
	};
}


/**
 * Produces an action indicating that triggers the removal of empty items in the Author Credit
 *
 * @returns {Action} The resulting REMOVE_EMPTY_CREDIT_ROWS action.
 */
export function removeEmptyCreditRows(): Action {
	return {
		type: REMOVE_EMPTY_CREDIT_ROWS
	};
}

/**
 * Produces an action indicating an existing Author Credit has been selected.
 * Used only on the Edition merge page
 *
 * @param {number} authorCredit - The selected existing Author Credit
 * @returns {Action} The resulting UPDATE_AUTHOR_CREDIT action.
 */
export function updateAuthorCredit(authorCredit: AuthorCredit): Action {
	return {
		payload: authorCredit,
		type: UPDATE_AUTHOR_CREDIT
	};
}

/**
 * @returns {Action} The resulting CLEAR_AUTHOR_CREDIT action.
 */
export function clearAuthorCredit(): Action {
	return {
		type: CLEAR_AUTHOR_CREDIT
	};
}

/**
 * @returns {Action} The resulting RESET_AUTHOR_CREDIT action.
 */
export function resetAuthorCredit(): Action {
	return {
		type: RESET_AUTHOR_CREDIT
	};
}

/**
 *  Produces an action indicating that the AC checkbox should be toggled.
 *
 * @returns {Action} The resulting TOGGLE_AUTHOR_CREDIT action.
 */
export function toggleAuthorCredit(): Action {
	return {
		type: TOGGLE_AUTHOR_CREDIT
	};
}

