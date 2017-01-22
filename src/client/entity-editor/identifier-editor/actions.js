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

export const ADD_IDENTIFIER_ROW = 'ADD_IDENTIFIER_ROW';
export const REMOVE_IDENTIFIER_ROW = 'REMOVE_IDENTIFIER_ROW';
export const UPDATE_IDENTIFIER_TYPE = 'UPDATE_IDENTIFIER_TYPE';
export const UPDATE_IDENTIFIER_VALUE = 'UPDATE_IDENTIFIER_VALUE';
export const HIDE_IDENTIFIER_EDITOR = 'HIDE_IDENTIFIER_EDITOR';


export function hideIdentifierEditor() {
	return {
		type: HIDE_IDENTIFIER_EDITOR
	};
}

let nextIdentifierRowId = 0;
export function addIdentifierRow() {
	/* Prepend 'n' here to indicate new identifier, and avoid conflicts with IDs
	 * of existing identifiers. */
	return {
		type: ADD_IDENTIFIER_ROW,
		payload: `n${nextIdentifierRowId++}`
	};
}

export function removeIdentifierRow(rowId) {
	return {
		type: REMOVE_IDENTIFIER_ROW,
		payload: rowId
	};
}

export function debouncedUpdateIdentifierValue(rowId, value, suggestedType) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_IDENTIFIER_VALUE,
		payload: {
			rowId,
			suggestedType,
			value
		}
	};
}

export function updateIdentifierType(rowId, value) {
	return {
		type: UPDATE_IDENTIFIER_TYPE,
		payload: {
			rowId,
			value
		}
	};
}
