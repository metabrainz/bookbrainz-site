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

export const ADD_IDENTIFIER = 'ADD_IDENTIFIER';
export const REMOVE_IDENTIFIER = 'REMOVE_IDENTIFIER';
export const UPDATE_IDENTIFIER_TYPE = 'UPDATE_IDENTIFIER_TYPE';
export const UPDATE_IDENTIFIER_VALUE = 'UPDATE_IDENTIFIER_VALUE';
export const HIDE_IDENTIFIER_EDITOR = 'HIDE_IDENTIFIER_EDITOR';


export function hideIdentifierEditor() {
	return {
		type: HIDE_IDENTIFIER_EDITOR
	};
}

let nextIdentifierId = 0;
export function addIdentifier() {
	return {
		type: ADD_IDENTIFIER,
		id: nextIdentifierId++
	};
}

export function removeIdentifier(index) {
	return {
		type: REMOVE_IDENTIFIER,
		index
	};
}

export function updateIdentifierValue(index, value, suggestedType) {
	return {
		type: UPDATE_IDENTIFIER_VALUE,
		index,
		suggestedType,
		value
	};
}

export function updateIdentifierType(index, value) {
	return {
		type: UPDATE_IDENTIFIER_TYPE,
		index,
		value
	};
}
