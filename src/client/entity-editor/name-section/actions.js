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

export const UPDATE_DISAMBIGUATION_FIELD = 'UPDATE_DISAMBIGUATION_FIELD';
export const UPDATE_LANGUAGE_FIELD = 'UPDATE_LANGUAGE_FIELD';
export const UPDATE_NAME_FIELD = 'UPDATE_NAME_FIELD';
export const UPDATE_SORT_NAME_FIELD = 'UPDATE_SORT_NAME_FIELD';

export function debouncedUpdateNameField(newName) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_NAME_FIELD,
		payload: newName
	};
}

export function debouncedUpdateSortNameField(newSortName) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_SORT_NAME_FIELD,
		payload: newSortName
	};
}

export function updateLanguageField(newLanguageId) {
	return {
		type: UPDATE_LANGUAGE_FIELD,
		payload: newLanguageId
	};
}

export function debouncedUpdateDisambiguationField(newDisambiguation) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_DISAMBIGUATION_FIELD,
		payload: newDisambiguation
	};
}
