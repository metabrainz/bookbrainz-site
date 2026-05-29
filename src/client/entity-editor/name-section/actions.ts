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

import {snakeCase as _snakeCase, find as _find, isString, remove, toLower as _toLower, uniqBy} from 'lodash';
import request from 'superagent';
import {addLanguage as addEditionLanguage} from '../edition-section/actions';
import {addLanguage as addWorkLanguage} from '../work-section/actions';

export const UPDATE_DISAMBIGUATION_FIELD = 'UPDATE_DISAMBIGUATION_FIELD';
export const UPDATE_LANGUAGE_FIELD = 'UPDATE_LANGUAGE_FIELD';
export const UPDATE_NAME_FIELD = 'UPDATE_NAME_FIELD';
export const UPDATE_SORT_NAME_FIELD = 'UPDATE_SORT_NAME_FIELD';
export const UPDATE_WARN_IF_EXISTS = 'UPDATE_WARN_IF_EXISTS';
export const UPDATE_SEARCH_RESULTS = 'UPDATE_SEARCH_RESULTS';
export const UPDATE_COPY_LANGUAGE_TO_CONTENT = 'UPDATE_COPY_LANGUAGE_TO_CONTENT';

export type Action = {
	type: string,
	payload?: unknown,
	meta?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the name for the entity being edited
 * should be updated with the provided value.
 *
 * @param {string} newName - The new value to be used for the name.
 * @returns {Action} The resulting UPDATE_NAME_FIELD action.
 */
export function updateNameField(newName: string): Action {
	return {
		payload: newName,
		type: UPDATE_NAME_FIELD
	};
}

/**
 * Produces an action indicating that the sort name for the entity being edited
 * should be updated with the provided value.
 *
 * @param {string} newSortName - The new value to be used for the sort name.
 * @returns {Action} The resulting UPDATE_SORT_NAME_FIELD action.
 */
export function updateSortNameField(newSortName: string): Action {
	return {
		payload: newSortName,
		type: UPDATE_SORT_NAME_FIELD
	};
}

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
 * @param {any} value - The new language value object.
 * @param {string} entityType - The type of entity being edited.
 * @param {boolean} copyLanguages - Whether to copy languages by default.
 * @returns {Function} A thunk that updates the language field and potentially syncs.
 */
export function updateLanguageAndSync(
	value: any,
	entityType: string,
	copyLanguages: boolean
): (dispatch: any, getState: any) => void {
	return (dispatch, getState) => {
		dispatch(updateLanguageField(value && value.value));
		const state = getState();
		const isChecked = state.getIn(['nameSection', 'copyLanguageToContent']);
		if (isChecked) {
			const lowerEntityType = _toLower(entityType);
			if (lowerEntityType === 'work') {
				const existingLanguages = state.getIn(['workSection', 'languages']);
				const alreadyExists = existingLanguages && existingLanguages.size > 0 &&
					existingLanguages.some((lang: any) => lang.get('value') === value.value);
				if (!alreadyExists) {
					dispatch(addWorkLanguage(value));
				}
			} else if (lowerEntityType === 'edition') {
				const existingLanguages = state.getIn(['editionSection', 'languages']);
				const alreadyExists = existingLanguages && existingLanguages.size > 0 &&
					existingLanguages.some((lang: any) => lang.get('value') === value.value);
				if (!alreadyExists) {
					dispatch(addEditionLanguage({label: value.label, value: value.value} as any));
				}
			}
		}
	};
}

/**
 * Produces an action indicating that the language of the name for the entity
 * being edited should be updated with the provided value.
 *
 * @param {string} newLanguageId - The new value to be used for the language ID.
 * @returns {Action} The resulting UPDATE_LANGUAGE_FIELD action.
 */
export function updateLanguageField(newLanguageId: number | null | undefined): Action {
	return {
		payload: newLanguageId,
		type: UPDATE_LANGUAGE_FIELD
	};
}

/**
 * Produces an action indicating that the 'copy language to content' checkbox
 * state should be updated.
 *
 * @param {boolean} checked - Whether the checkbox is checked.
 * @param {string} entityType - The type of entity being edited.
 * @param {Array} languageOptions - The available language options.
 * @returns {Function} A thunk that updates the state and potentially syncs the language.
 */
export function toggleCopyLanguageToContent(
	checked: boolean,
	entityType: string,
	languageOptions: any[]
): (dispatch: any, getState: any) => void {
	return (dispatch, getState) => {
		dispatch({
			payload: checked,
			type: UPDATE_COPY_LANGUAGE_TO_CONTENT
		});

		if (checked) {
			const state = getState();
			const languageId = state.getIn(['nameSection', 'language']);
			if (languageId) {
				const option = _find(languageOptions, {id: languageId}) as any;
				if (option) {
					const lowerEntityType = _toLower(entityType);
					if (lowerEntityType === 'work') {
						const existingLanguages = state.getIn(['workSection', 'languages']);
						const alreadyExists = existingLanguages && existingLanguages.size > 0 &&
							existingLanguages.some((lang: any) => lang.get('value') === option.id);
						if (!alreadyExists) {
							dispatch(addWorkLanguage({label: option.name, value: option.id}));
						}
					} else if (lowerEntityType === 'edition') {
						const existingLanguages = state.getIn(['editionSection', 'languages']);
						const alreadyExists = existingLanguages && existingLanguages.size > 0 &&
							existingLanguages.some((lang: any) => lang.get('value') === option.id);
						if (!alreadyExists) {
							dispatch(addEditionLanguage({label: option.name, value: option.id} as any));
						}
					}
				}
			}
		}
	};
}

/**
 * Produces an action indicating that the 'copy language to content' checkbox
 * state should be updated.
 *
 * @param {boolean} checked - Whether the checkbox is checked.
 * @returns {Action} The resulting UPDATE_COPY_LANGUAGE_TO_CONTENT action.
 */
export function updateCopyLanguageToContent(checked: boolean): Action {
	return {
		payload: checked,
		type: UPDATE_COPY_LANGUAGE_TO_CONTENT
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
 * @param  {string} entityBBID - The BBID of the current entity, if it already exists
 * @param  {string} entityType - The entity type of the value to be checked.
 * @param  {string} action - An optional redux action to dispatch. Defaults to UPDATE_WARN_IF_EXISTS
 * @returns {checkIfNameExists~dispatch} The returned function.
 */
export function checkIfNameExists(
	name: string,
	entityBBID: string,
	entityType: string,
	action: string | null | undefined
): (arg: (arg: Action) => unknown) => unknown {
	/**
	 * @function dispatch
	 * @param  {function} dispatch - The redux dispatch function.
	 */
	return async (dispatch) => {
		if (!name ||
			_snakeCase(entityType) === 'edition' ||
			(_snakeCase(entityType) === 'edition_group' && action === UPDATE_WARN_IF_EXISTS)
		) {
			dispatch({
				payload: null,
				type: action || UPDATE_WARN_IF_EXISTS
			});
			return;
		}
		try {
			const res = await request.get('/search/exists')
				.query({
					q: name,
					type: _snakeCase(entityType)
				});

			let payload = JSON.parse(res.text) || null;
			if (Array.isArray(payload)) {
				payload = uniqBy(payload, 'bbid');
				// Filter out the current entity (if any)
				if (isString(entityBBID)) {
					remove(payload, ({bbid}) => entityBBID === bbid);
				}
			}
			dispatch({
				payload,
				type: action || UPDATE_WARN_IF_EXISTS
			});
		}
		catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	};
}

/**
 * Produces an action containing search results of the name entered by the user.
 *  This is done by asynchronously calling the route /search/autocomplete.
 *
 * @param  {string} name - The value to be checked if it already exists.
 * @param  {string} entityBBID - The BBID of the current entity, if it already exists
 * @param  {string} type - Entity type of the name.
 * @returns {searchName~dispatch} The returned function.
 */
export function searchName(
	name: string,
	entityBBID: string,
	type: string
): (arg: (arg: Action) => unknown) => unknown {
	/**
	 * @function dispatch
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
				size: 3,
				type
			})
			.then(res => {
				const searchResults = JSON.parse(res.text);
				// Filter out the current entity (if any)
				if (isString(entityBBID)) {
					remove(searchResults, ({bbid}) => entityBBID === bbid);
				}
				dispatch({
					payload: searchResults,
					type: UPDATE_SEARCH_RESULTS
				});
			});
	};
}
