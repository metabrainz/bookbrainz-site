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

import {snakeCase as _snakeCase, uniqBy} from 'lodash';
import request from 'superagent';


export const UPDATE_DISAMBIGUATION_FIELD = 'UPDATE_DISAMBIGUATION_FIELD';
export const UPDATE_LANGUAGE_FIELD = 'UPDATE_LANGUAGE_FIELD';
export const UPDATE_NAME_FIELD = 'UPDATE_NAME_FIELD';
export const UPDATE_SORT_NAME_FIELD = 'UPDATE_SORT_NAME_FIELD';
export const UPDATE_WARN_IF_EXISTS = 'UPDATE_WARN_IF_EXISTS';
export const UPDATE_SEARCH_RESULTS = 'UPDATE_SEARCH_RESULTS';

export type Action = {
	type: string,
	payload?: mixed,
	metadata?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the name for the entity being edited
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newName - The new value to be used for the name.
 * @returns {Action} The resulting UPDATE_NAME_FIELD action.
 */
export function debouncedUpdateNameField(newName: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newName,
		type: UPDATE_NAME_FIELD
	};
}

/**
 * Produces an action indicating that the sort name for the entity being edited
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newSortName - The new value to be used for the sort name.
 * @returns {Action} The resulting UPDATE_SORT_NAME_FIELD action.
 */
export function debouncedUpdateSortNameField(newSortName: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newSortName,
		type: UPDATE_SORT_NAME_FIELD
	};
}

/**
 * Produces an action indicating that the language of the name for the entity
 * being edited should be updated with the provided value.
 *
 * @param {string} newLanguageId - The new value to be used for the language ID.
 * @returns {Action} The resulting UPDATE_LANGUAGE_FIELD action.
 */
export function updateLanguageField(newLanguageId: ?number): Action {
	return {
		payload: newLanguageId,
		type: UPDATE_LANGUAGE_FIELD
	};
}

/**
 * Produces an action indicating that the disambiguation for the entity being
 * edited should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newDisambiguation - The new value to be used for the
 *        disambiguation.
 * @returns {Action} The resulting UPDATE_SORT_NAME_FIELD action.
 */
export function debouncedUpdateDisambiguationField(
	newDisambiguation: string
): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newDisambiguation,
		type: UPDATE_DISAMBIGUATION_FIELD
	};
}

/**
 * Produces an action containing boolean value indicating if the name of the
 * entity already exists. This is done by asynchronously checking if the name
 * of the entity already exists in the database.
 *
 * @param  {string} name - The value to be checked if it already exists.
 * @param  {string} entityType - The entity type of the value to be checked.
 * @param  {string} action - An optional redux action to dispatch. Defaults to UPDATE_WARN_IF_EXISTS
 * @returns {many_prompts~inner} The returned function.
 */
export function checkIfNameExists(
	name: string,
	entityType: string,
	action: ?string
): ((Action) => mixed) => mixed {
	/**
	 * @param  {function} dispatch - The redux dispatch function.
	 */
	return (dispatch) => {
		if (!name) {
			dispatch({
				payload: null,
				type: action || UPDATE_WARN_IF_EXISTS
			});
			return;
		}
		request.get('/search/exists')
			.query({
				q: name,
				type: _snakeCase(entityType)
			})
			.then(res => {
				let payload = JSON.parse(res.text) || null;
				if (Array.isArray(payload)) {
					payload = uniqBy(payload, 'bbid');
				}
				return dispatch({
					payload,
					type: action || UPDATE_WARN_IF_EXISTS
				});
			})
			.catch((error: {message: string}) => error);
	};
}

/**
 * Produces an action containing search results of the name entered by the user.
 *  This is done by asynchronously calling the route /search/autocomplete.
 *
 * @param  {string} name - The value to be checked if it already exists.
 * @param  {string} type - Entity type of the name.
 * @returns {many_prompts~inner} The returned function.
 */
export function searchName(
	name: string,
	type: string,
): ((Action) => mixed) => mixed {
	/**
	 * @param  {function} dispatch - The redux dispatch function.
	 */
	return (dispatch) => {
		if (!name) {
			dispatch({
				payload: null,
				type: UPDATE_SEARCH_RESULTS
			});
			return;
		}
		request.get('/search/autocomplete')
			.query({
				q: name,
				type
			})
			.then(res => dispatch({
				payload: JSON.parse(res.text),
				type: UPDATE_SEARCH_RESULTS
			}));
	};
}
