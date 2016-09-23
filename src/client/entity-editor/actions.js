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
const HIDE_ALIAS_EDITOR = 'HIDE_ALIAS_EDITOR';
const UPDATE_ALIAS_NAME = 'UPDATE_ALIAS_NAME';
const UPDATE_ALIAS_SORT_NAME = 'UPDATE_ALIAS_SORT_NAME';
const ADD_ALIAS = 'ADD_ALIAS';
const UPDATE_ALIAS_LANGUAGE = 'UPDATE_ALIAS_LANGUAGE';
const UPDATE_ALIAS_PRIMARY = 'UPDATE_ALIAS_PRIMARY';
const REMOVE_ALIAS = 'REMOVE_ALIAS';
const UPDATE_GENDER = 'UPDATE_GENDER';

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

export function hideAliasEditor() {
	return {
		type: HIDE_ALIAS_EDITOR
	};
}

export function updateAliasName(index, value) {
	return {
		type: UPDATE_ALIAS_NAME,
		index,
		value
	};
}

export function updateAliasSortName(index, value) {
	return {
		type: UPDATE_ALIAS_SORT_NAME,
		index,
		value
	};
}

export function updateAliasLanguage(index, value) {
	return {
		type: UPDATE_ALIAS_LANGUAGE,
		index,
		value
	};
}

export function updateAliasPrimary(index, value) {
	return {
		type: UPDATE_ALIAS_PRIMARY,
		index,
		value
	};
}

let nextAliasId = 0;
export function addAlias() {
	return {
		type: ADD_ALIAS,
		id: nextAliasId++
	};
}

export function removeAlias(index) {
	return {
		type: REMOVE_ALIAS,
		index
	};
}

export function updateGender(value) {
	return {
		type: UPDATE_GENDER,
		value
	};
}
