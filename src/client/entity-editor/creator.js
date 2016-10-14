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

import CreatorData from './creator-data';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import React from 'react';
import {combineReducers} from 'redux-immutable';
import {createStore} from 'redux';
import aliasEditorReducer from './alias-editor/reducer';
import sharedDataReducer from './shared-data/reducer';
import creatorDataReducer from './creator-data/reducer';
import identifierEditorReducer from './identifier-editor/reducer';

const rootReducer = combineReducers({
	sharedData: sharedDataReducer,
	aliasEditor: aliasEditorReducer,
	creatorData: creatorDataReducer,
	identifierEditor: identifierEditorReducer
});

let store = null;
if (typeof window === 'undefined') {
	store = createStore(rootReducer, Immutable.Map({
		sharedData: Immutable.Map({
			nameValue: '',
			sortNameValue: '',
			languageValue: null,
			disambiguationVisible: false,
			aliasEditorVisible: false
		}),
		aliasEditor: Immutable.Map()
	}));
}
else {
	store = createStore(rootReducer, Immutable.Map({
		sharedData: Immutable.Map({
			nameValue: '',
			sortNameValue: '',
			languageValue: null,
			disambiguationVisible: false,
			aliasEditorVisible: false
		}),
		aliasEditor: Immutable.Map()
	}), window.devToolsExtension && window.devToolsExtension());
}

const Creator = ({
	languages,
	genders,
	creatorTypes,
	identifierTypes,
	submissionUrl
}) => (
	<Provider store={store}>
		<CreatorData languageOptions={languages} genderOptions={genders} creatorTypes={creatorTypes} identifierTypes={identifierTypes} submissionUrl={submissionUrl}/>
	</Provider>
);
Creator.displayName = 'Creator';
Creator.propTypes = {
	languages: React.PropTypes.array,
	genders: React.PropTypes.array,
	creatorTypes: React.PropTypes.array,
	identifierTypes: React.PropTypes.array
};

export default Creator;
