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

type LanguageOption = {
	name: string,
	id: number
};

type Publisher = {
	value: string,
	id: number
};

type EditionGroup = {
	value: string,
	id: number
};

export type Action = {
	payload?: unknown,
	type: string,
	meta?: Record<string, unknown>
};

export const DISABLE_PHYSICAL = 'DISABLE_PHYSICAL';
export const ENABLE_PHYSICAL = 'ENABLE_PHYSICAL';
export const UPDATE_EDITION_GROUP = 'UPDATE_EDITION_GROUP';
export const UPDATE_PUBLISHER = 'UPDATE_PUBLISHER';
export const UPDATE_RELEASE_DATE = 'UPDATE_RELEASE_DATE';
export const UPDATE_FORMAT = 'UPDATE_FORMAT';
export const UPDATE_LANGUAGES = 'UPDATE_LANGUAGES';
export const ADD_LANGUAGE = 'ADD_LANGUAGE';
export const UPDATE_STATUS = 'UPDATE_STATUS';
export const UPDATE_WEIGHT = 'UPDATE_WEIGHT';
export const UPDATE_PAGES = 'UPDATE_PAGES';
export const UPDATE_WIDTH = 'UPDATE_WIDTH';
export const UPDATE_HEIGHT = 'UPDATE_HEIGHT';
export const UPDATE_DEPTH = 'UPDATE_DEPTH';
export const TOGGLE_SHOW_EDITION_GROUP = 'TOGGLE_SHOW_EDITION_GROUP';
export const UPDATE_WARN_IF_EDITION_GROUP_EXISTS = 'UPDATE_WARN_IF_EDITION_GROUP_EXISTS';


/**
 * Produces an action indicating that the edition status for the edition being
 * edited should be updated with the provided value.
 *
 * @param {number} newStatusId - The new value to be used for the edition
 *                 status ID.
 * @returns {Action} The resulting UPDATE_STATUS action.
 */
export function updateStatus(newStatusId: number | null | undefined): Action {
	return {
		payload: newStatusId,
		type: UPDATE_STATUS
	};
}

/**
 * Produces an action indicating that the edition format for the edition being
 * edited should be updated with the provided value.
 *
 * @param {number} newFormatId - The new value to be used for the edition
 *                 format ID.
 * @returns {Action} The resulting UPDATE_FORMAT action.
 */
export function updateFormat(newFormatId: number | null | undefined): Action {
	return {
		payload: newFormatId,
		type: UPDATE_FORMAT
	};
}

/**
 * Produces an action indicating that the release date for the edition
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {string} newReleaseDate - The new value to be used for the release
 *                 date.
 * @returns {Action} The resulting UPDATE_RELEASE_DATE action.
 */
export function debouncedUpdateReleaseDate(newReleaseDate: string | null | undefined): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newReleaseDate,
		type: UPDATE_RELEASE_DATE
	};
}

/**
 * Produces an action indicating that the edition languages for the edition
 * being edited should be updated with the provided values.
 *
 * @param {LanguageOption} newLanguages - The new objects to be used for the
 *                         edition languages.
 * @returns {Action} The resulting UPDATE_LANGUAGES action.
 */
export function updateLanguages(newLanguages: Array<LanguageOption>): Action {
	return {
		payload: newLanguages,
		type: UPDATE_LANGUAGES
	};
}

/**
 * Produces an action indicating that new language should be added to languages field.
 *
 * @param {LanguageOption} newLanguage - The new language to be added/
 * @returns {Action} The resulting ADD_LANGUAGE action.
 */
export function addLanguage(newLanguage: LanguageOption): Action {
	return {
		payload: newLanguage,
		type: ADD_LANGUAGE
	};
}

/**
 * Produces an action indicating that the physical section of the edition
 * form should be editable.
 *
 * @returns {Action} The resulting ENABLE_PHYSICAL action.
 */
export function enablePhysical(): Action {
	return {
		type: ENABLE_PHYSICAL
	};
}

/**
 * Produces an action indicating that the physical section of the edition
 * form should not be editable.
 *
 * @returns {Action} The resulting DISABLE_PHYSICAL action.
 */
export function disablePhysical(): Action {
	return {
		type: DISABLE_PHYSICAL
	};
}

/**
 * Produces an action indicating that the Edition Group section of the edition
 * form should be shown.
 *
 * @param {boolean} showEGSection: Whether to show the Edition Group selection section or not
 *
 * @returns {Action} The resulting TOGGLE_SHOW_EDITION_GROUP action.
 */
export function toggleShowEditionGroup(showEGSection: boolean): Action {
	return {
		payload: showEGSection,
		type: TOGGLE_SHOW_EDITION_GROUP
	};
}

/**
 * Produces an action indicating that the publisher for the edition
 * being edited should be updated with the provided value.
 *
 * @param {Publisher} newPublisher - The new publisher object to be set for
 *                                   the edition.
 * @returns {Action} The resulting UPDATE_PUBLISHER action.
 */
export function updatePublisher(newPublisher: Record<string, Publisher>): Action {
	return {
		payload: newPublisher,
		type: UPDATE_PUBLISHER
	};
}

/**
 * Produces an action indicating that the Edition Group for the edition
 * being edited should be updated with the provided value.
 *
 * @param {EditionGroup} newEditionGroup - The new EditionGroup object to be set
 *                      for the edition.
 * @returns {Action} The resulting UPDATE_EDITION_GROUP action.
 */
export function updateEditionGroup(newEditionGroup: EditionGroup | null): Action {
	return {
		payload: newEditionGroup,
		type: UPDATE_EDITION_GROUP
	};
}

/**
 * Produces an action indicating that the weight for the edition
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {number} value - The new value to be used for the edition weight.
 * @returns {Action} The resulting UPDATE_WEIGHT action.
 */
export function debouncedUpdateWeight(value: number | null | undefined): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: value,
		type: UPDATE_WEIGHT
	};
}

/**
 * Produces an action indicating that the number of pages for the edition
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {number} value - The new value to be used for the number of pages.
 * @returns {Action} The resulting UPDATE_PAGES action.
 */
export function debouncedUpdatePages(value: number | null | undefined): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: value,
		type: UPDATE_PAGES
	};
}

/**
 * Produces an action indicating that the width for the edition
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {number} value - The new value to be used for the width.
 * @returns {Action} The resulting UPDATE_WIDTH action.
 */
export function debouncedUpdateWidth(value: number | null | undefined): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: value,
		type: UPDATE_WIDTH
	};
}

/**
 * Produces an action indicating that the height for the edition
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {number} value - The new value to be used for the height.
 * @returns {Action} The resulting UPDATE_HEIGHT action.
 */
export function debouncedUpdateHeight(value: number | null | undefined): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: value,
		type: UPDATE_HEIGHT
	};
}

/**
 * Produces an action indicating that the depth for the edition
 * should be updated with the provided value. The action is marked to be
 * debounced by the keystroke debouncer defined for redux-debounce.
 *
 * @param {number} value - The new value to be used for the depth.
 * @returns {Action} The resulting UPDATE_DEPTH action.
 */
export function debouncedUpdateDepth(value: number | null | undefined): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: value,
		type: UPDATE_DEPTH
	};
}

