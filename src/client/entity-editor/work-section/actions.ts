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


export const UPDATE_LANGUAGES = 'UPDATE_LANGUAGES';
export const UPDATE_TYPE = 'UPDATE_TYPE';

type LanguageOption = {
	label: string,
	value: number
};

export type Action = {
	payload: unknown,
	type: string,
	metadata?: Record<string, unknown>
};

/**
 * Produces an action indicating that the work type for the work being
 * edited should be updated with the provided value.
 *
 * @param {number} newTypeId - The new value to be used for the work type ID.
 * @returns {Action} The resulting UPDATE_TYPE action.
 */
export function updateType(newTypeId: number | null | undefined): Action {
	return {
		payload: newTypeId,
		type: UPDATE_TYPE
	};
}

/**
 * Produces an action indicating that the work languages for the work being
 * edited should be updated with the provided values.
 *
 * @param {LanguageOption} newLanguages - The new objects to be used for the
 *                         work languages.
 * @returns {Action} The resulting UPDATE_LANGUAGES action.
 */
export function updateLanguages(newLanguages: Array<LanguageOption>): Action {
	return {
		payload: newLanguages,
		type: UPDATE_LANGUAGES
	};
}
