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

export const UPDATE_ALIAS_NAME = 'UPDATE_ALIAS_NAME';
export const UPDATE_ALIAS_SORT_NAME = 'UPDATE_ALIAS_SORT_NAME';
export const ADD_ALIAS_ROW = 'ADD_ALIAS_ROW';
export const UPDATE_ALIAS_LANGUAGE = 'UPDATE_ALIAS_LANGUAGE';
export const UPDATE_ALIAS_PRIMARY = 'UPDATE_ALIAS_PRIMARY';
export const REMOVE_ALIAS_ROW = 'REMOVE_ALIAS_ROW';
export const HIDE_ALIAS_EDITOR = 'HIDE_ALIAS_EDITOR';
export const REMOVE_EMPTY_ALIASES = 'REMOVE_EMPTY_ALIASES';

export type Action = {
	type: string,
	payload?: unknown,
	meta?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the name for a particular alias within
 * the editor should be updated with the provided value. The action is
 * marked to be debounced by the keystroke debouncer defined for
 * redux-debounce.
 *
 * @param {number} rowId - The ID of the row in the alias editor to update.
 * @param {string} value - The new value to be used for the alias name.
 * @returns {Action} The resulting UPDATE_ALIAS_NAME action.
 */
export function debouncedUpdateAliasName(rowId: number, value: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: {
			rowId,
			value
		},
		type: UPDATE_ALIAS_NAME
	};
}

/**
 * Produces an action indicating that the sort name for a particular alias
 * within the editor should be updated with the provided value. The action is
 * marked to be debounced by the keystroke debouncer defined for
 * redux-debounce.
 *
 * @param {number} rowId - The ID of the row in the alias editor to update.
 * @param {string} value - The new value to be used for the alias sort name.
 * @returns {Action} The resulting UPDATE_ALIAS_SORT_NAME action.
 */
export function debouncedUpdateAliasSortName(
	rowId: number, value: string
): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: {
			rowId,
			value
		},
		type: UPDATE_ALIAS_SORT_NAME
	};
}

/**
 * Produces an action indicating that the language for a particular alias
 * within the editor should be updated with the provided value.
 *
 * @param {number} rowId - The ID of the row in the alias editor to update.
 * @param {number} value - The new value to be used for the alias language ID.
 * @returns {Action} The resulting UPDATE_ALIAS_LANGUAGE action.
 */
export function updateAliasLanguage(rowId: number, value: number | null | undefined): Action {
	return {
		payload: {
			rowId,
			value
		},
		type: UPDATE_ALIAS_LANGUAGE
	};
}

/**
 * Produces an action indicating that the primary flag for a particular alias
 * within the editor should be updated with the provided value.
 *
 * @param {number} rowId - The ID of the row in the alias editor to update.
 * @param {boolean} value - The new value to be used for the alias primary flag.
 * @returns {Action} The resulting UPDATE_ALIAS_PRIMARY action.
 */
export function updateAliasPrimary(rowId: number, value: boolean): Action {
	return {
		payload: {
			rowId,
			value
		},
		type: UPDATE_ALIAS_PRIMARY
	};
}

let nextAliasRowId = 0;

/**
 * Produces an action indicating that a row for a new alias should be added
 * to the alias editor. The row is assigned an ID based on an incrementing
 * variable existing on the client.
 *
 * @returns {Action} The resulting ADD_ALIAS_ROW action.
 */
export function addAliasRow(): Action {
	/*
	 * Prepend 'n' here to indicate new alias, and avoid conflicts with IDs of
	 * existing aliases.
	 */
	return {
		payload: `n${nextAliasRowId++}`,
		type: ADD_ALIAS_ROW
	};
}

/**
 * Produces an action indicating that the row with the provided ID should be
 * removed from the alias editor.
 *
 * @param {number} rowId - The ID for the row to be deleted.
 * @returns {Action} The resulting REMOVE_ALIAS_ROW action.
 */
export function removeAliasRow(rowId: number): Action {
	return {
		payload: rowId,
		type: REMOVE_ALIAS_ROW
	};
}

/**
 * Produces an action indicating that the alias editor should be hidden from
 * view.
 *
 * @see showAliasEditor
 *
 * @returns {Action} The resulting HIDE_ALIAS_EDITOR action.
 */
export function hideAliasEditor(): Action {
	return {
		type: HIDE_ALIAS_EDITOR
	};
}

/**
 * Produces an action indicating that the empty rows should be deleted.
 *
 * @returns {Action} The resulting REMOVE_EMPTY_ALIASES action.
 */
export function removeEmptyAliases(): Action {
	return {
		type: REMOVE_EMPTY_ALIASES
	};
}
