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


/**
 * Produces an action indicating that the name for the entity being edited
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newName - The new value to be used for the name.
 * @returns {Object} The resulting UPDATE_NAME_FIELD action.
 **/
export function debouncedUpdateNameField(newName) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_NAME_FIELD,
		payload: newName
	};
}

/**
 * Produces an action indicating that the sort name for the entity being edited
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newSortName - The new value to be used for the sort name.
 * @returns {Object} The resulting UPDATE_SORT_NAME_FIELD action.
 **/
export function debouncedUpdateSortNameField(newSortName) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_SORT_NAME_FIELD,
		payload: newSortName
	};
}

/**
 * Produces an action indicating that the language of the name for the entity
 * being edited should be updated with the provided value.
 *
 * @param {string} newLanguageId - The new value to be used for the language ID.
 * @returns {Object} The resulting UPDATE_LANGUAGE_FIELD action.
 **/
export function updateLanguageField(newLanguageId) {
	return {
		type: UPDATE_LANGUAGE_FIELD,
		payload: newLanguageId
	};
}

/**
 * Produces an action indicating that the disambiguation for the entity being
 * edited should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newDisambiguation - The new value to be used for the
 *        disambiguation.
 * @returns {Object} The resulting UPDATE_SORT_NAME_FIELD action.
 **/
export function debouncedUpdateDisambiguationField(newDisambiguation) {
	return {
		meta: {debounce: 'keystroke'},
		type: UPDATE_DISAMBIGUATION_FIELD,
		payload: newDisambiguation
	};
}
