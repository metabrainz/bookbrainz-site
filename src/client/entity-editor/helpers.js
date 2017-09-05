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

import CreatorSection from './creator-section/creator-section';
import WorkSection from './work-section/work-section';
import aliasEditorReducer from './alias-editor/reducer';
import buttonBarReducer from './button-bar/reducer';
import {combineReducers} from 'redux-immutable';
import creatorSectionReducer from './creator-section/reducer';
import identifierEditorReducer from './identifier-editor/reducer';
import nameSectionReducer from './name-section/reducer';
import submissionSectionReducer from './submission-section/reducer';
import workSectionReducer from './work-section/reducer';


export function isAliasEmpty(
	nameValue: string, sortNameValue: string
): boolean {
	return !(nameValue.length || sortNameValue.length);
}

export function getEntitySection(entityType: string) {
	const SECTION_MAP = {
		creator: CreatorSection,
		work: WorkSection
	};

	return SECTION_MAP[entityType];
}

function getEntitySectionReducer(entityType: string) {
	const SECTION_REDUCER_MAP = {
		creator: creatorSectionReducer,
		work: workSectionReducer
	};

	return SECTION_REDUCER_MAP[entityType];
}

function getEntitySectionReducerName(entityType: string): string {
	return `${entityType}Section`;
}

export function createRootReducer(entityType: string) {
	const entityReducerKey = getEntitySectionReducerName(entityType);
	const entityReducer = getEntitySectionReducer(entityType);

	return combineReducers({
		aliasEditor: aliasEditorReducer,
		buttonBar: buttonBarReducer,
		[entityReducerKey]: entityReducer,
		identifierEditor: identifierEditorReducer,
		nameSection: nameSectionReducer,
		submissionSection: submissionSectionReducer
	});
}

export function shouldDevToolsBeInjected(): boolean {
	return Boolean(
		typeof window === 'object' &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	);
}
