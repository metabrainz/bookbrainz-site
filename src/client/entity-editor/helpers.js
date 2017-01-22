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

import aliasEditorReducer from './alias-editor/reducer';
import buttonBarReducer from './button-bar/reducer';
import {combineReducers} from 'redux-immutable';
import identifierEditorReducer from './identifier-editor/reducer';
import nameSectionReducer from './name-section/reducer';
import submissionSectionReducer from './submission-section/reducer';

export function isAliasEmpty(nameValue, sortNameValue) {
	return !(nameValue.length || sortNameValue.length);
}

export function createRootReducer(entityReducerKey, entityReducer) {
	return combineReducers({
		buttonBar: buttonBarReducer,
		aliasEditor: aliasEditorReducer,
		[entityReducerKey]: entityReducer,
		identifierEditor: identifierEditorReducer,
		nameSection: nameSectionReducer,
		submissionSection: submissionSectionReducer
	});
}
