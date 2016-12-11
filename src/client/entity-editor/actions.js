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

const UPDATE_LANGUAGE_FIELD = 'UPDATE_LANGUAGE_FIELD';
const UPDATE_NAME_FIELD = 'UPDATE_NAME_FIELD';
const UPDATE_SORT_NAME_FIELD = 'UPDATE_SORT_NAME_FIELD';
const UPDATE_DISAMBIGUATION_FIELD = 'UPDATE_DISAMBIGUATION_FIELD';
const SHOW_ALIAS_EDITOR = 'SHOW_ALIAS_EDITOR';
const UPDATE_GENDER = 'UPDATE_GENDER';
const UPDATE_TYPE = 'UPDATE_TYPE';
const UPDATE_BEGIN_DATE = 'UPDATE_BEGIN_DATE';
const UPDATE_END_DATE = 'UPDATE_END_DATE';
const UPDATE_ENDED = 'UPDATE_ENDED';
const SHOW_IDENTIFIER_EDITOR = 'SHOW_IDENTIFIER_EDITOR';
const HIDE_IDENTIFIER_EDITOR = 'HIDE_IDENTIFIER_EDITOR';
const ADD_IDENTIFIER = 'ADD_IDENTIFIER';
const REMOVE_IDENTIFIER = 'REMOVE_IDENTIFIER';
const UPDATE_IDENTIFIER_TYPE = 'UPDATE_IDENTIFIER_TYPE';
const UPDATE_IDENTIFIER_VALUE = 'UPDATE_IDENTIFIER_VALUE';
const SET_SUBMIT_ERROR = 'SET_SUBMIT_ERROR';

export function updateNameField(value) {
	return {
		type: UPDATE_NAME_FIELD,
		value
	};
}

export function updateSortNameField(value) {
	return {
		type: UPDATE_SORT_NAME_FIELD,
		value
	};
}

export function updateLanguageField(value) {
	return {
		type: UPDATE_LANGUAGE_FIELD,
		value
	};
}

export function updateDisambiguationField(value) {
	return {
		type: UPDATE_DISAMBIGUATION_FIELD,
		value
	};
}

export function showAliasEditor() {
	return {
		type: SHOW_ALIAS_EDITOR
	};
}

export function updateGender(value) {
	return {
		type: UPDATE_GENDER,
		value
	};
}

export function updateType(value, singular) {
	return {
		type: UPDATE_TYPE,
		value,
		singular
	};
}

export function updateBeginDate(value) {
	return {
		type: UPDATE_BEGIN_DATE,
		value
	};
}

export function updateEndDate(value) {
	return {
		type: UPDATE_END_DATE,
		value
	};
}

export function updateEnded(value) {
	return {
		type: UPDATE_ENDED,
		value
	};
}

export function showIdentifierEditor() {
	return {
		type: SHOW_IDENTIFIER_EDITOR
	};
}

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

export function setSubmitError(error) {
	return {
		type: SET_SUBMIT_ERROR,
		error
	};
}
