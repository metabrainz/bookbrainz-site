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
import aliasEditorReducer from './alias-editor/reducer';
import buttonBarReducer from './button-bar/reducer';
import {combineReducers} from 'redux-immutable';
import {createStore} from 'redux';
import creatorSectionReducer from './creator-section/reducer';
import identifierEditorReducer from './identifier-editor/reducer';
import nameSectionReducer from './name-section/reducer';
import submissionSectionReducer from './submission-section/reducer'

const rootReducer = combineReducers({
	buttonBar: buttonBarReducer,
	aliasEditor: aliasEditorReducer,
	creatorSection: creatorSectionReducer,
	identifierEditor: identifierEditorReducer,
	nameSection: nameSectionReducer,
	submissionSection: submissionSectionReducer
});

function generateInitialState(creator, creatorTypes) {
	if (!creator) {
		return Immutable.Map({
			sharedData: Immutable.Map({
				name: '',
				sortName: '',
				language: null,
				disambiguation: '',
				disambiguationVisible: false,
				aliasEditorVisible: false
			}),
			aliasEditor: Immutable.Map()
		});
	}

	const aliases = creator.aliasSet ?
		creator.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const name = aliases.length > 0 ? aliases[0] : {
		name: '',
		sortName: '',
		language: null
	};

	const aliasDict = {};
	aliases.slice(1).forEach((alias) => aliasDict[alias.id] = alias);

	const initialGender = creator.gender && creator.gender.id;
	const initialCreatorType = creator.creatorType && creator.creatorType.id;
	const initialDisambiguation =
		creator.disambiguation && creator.disambiguation.comment;
	const identifiers = creator.identifierSet ?
		creator.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierDict = {};
	identifiers.forEach(
		(identifier) => identifierDict[identifier.id] = identifier
	);

	const personType = creatorTypes.find((type) => type.label === 'Person');
	return Immutable.Map({
		sharedData: Immutable.Map({
			disambiguationVisible: Boolean(initialDisambiguation),
			disambiguation: initialDisambiguation,
			aliasEditorVisible: false,
			...name
		}),
		aliasEditor: Immutable.fromJS(aliasDict),
		creatorSection: Immutable.Map({
			gender: initialGender,
			type: initialCreatorType,
			beginDate: creator.beginDate,
			endDate: creator.endDate,
			ended: creator.ended,
			singular: initialCreatorType === personType.id
		}),
		identifierEditor: Immutable.fromJS(identifierDict)
	});
}

const Creator = ({
	languages,
	genders,
	creator,
	creatorTypes,
	identifierTypes,
	submissionUrl
}) => {
	let store = null;
	if (typeof window === 'undefined') {
		store = createStore(
			rootReducer,
			generateInitialState(creator, creatorTypes)
		);
	}
	else {
		store = createStore(
			rootReducer,
			generateInitialState(creator, creatorTypes),
			window.devToolsExtension && window.devToolsExtension()
		);
	}

	return (
		<Provider store={store}>
			<CreatorData
				creatorTypes={creatorTypes}
				genderOptions={genders}
				identifierTypes={identifierTypes}
				languageOptions={languages}
				submissionUrl={submissionUrl}
			/>
		</Provider>
	);
};
Creator.displayName = 'Creator';
Creator.propTypes = {
	creator: React.PropTypes.object,
	creatorTypes: React.PropTypes.array,
	genders: React.PropTypes.array,
	identifierTypes: React.PropTypes.array,
	languages: React.PropTypes.array,
	submissionUrl: React.PropTypes.string
};

export default Creator;
