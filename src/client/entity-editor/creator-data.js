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


import AliasEditor from './alias-editor/alias-editor';
import ButtonBar from './button-bar/button-bar';
import CreatorSection from './creator-section/creator-section';
import IdentifierEditor from './identifier-editor/identifier-editor';
import NameSection from './name-section/name-section';
import SubmissionSection from './submission-section/submission-section'
import {Panel} from 'react-bootstrap';
import React from 'react';
import {connect} from 'react-redux';


let Wrapper = ({
	aliasEditorVisible,
	identifierEditorVisible,
	languageOptions,
	genderOptions,
	identifierTypes,
	creatorTypes,
	submissionUrl
}) => {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		value: language.id,
		label: language.name
	}));

	const genderOptionsForDisplay = genderOptions.map((gender) => ({
		value: gender.id,
		label: gender.name
	}));

	const creatorTypesForDisplay = creatorTypes.map((type) => ({
		value: type.id,
		label: type.label
	}));

	return (
		<Panel>
			<AliasEditor
				languageOptions={languageOptionsForDisplay}
				show={aliasEditorVisible}
			/>
			<NameSection
				languageOptions={languageOptionsForDisplay}
			/>
			<ButtonBar/>
			<CreatorSection
				creatorTypes={creatorTypesForDisplay}
				genderOptions={genderOptionsForDisplay}
			/>
			<SubmissionSection
				submissionUrl={submissionUrl}
			/>
			<IdentifierEditor
				show={identifierEditorVisible}
				typeOptions={identifierTypes}
			/>
		</Panel>
	);
};
Wrapper.displayName = 'Wrapper';
Wrapper.propTypes = {
	aliasEditorVisible: React.PropTypes.bool,
	creatorTypes: React.PropTypes.array,
	genderOptions: React.PropTypes.array,
	identifierEditorVisible: React.PropTypes.array,
	identifierTypes: React.PropTypes.array,
	languageOptions: React.PropTypes.array
};

function mapStateToProps(rootState) {
	const state = rootState.get('buttonBar');
	return {
		aliasEditorVisible: state.get('aliasEditorVisible'),
		identifierEditorVisible: state.get('identifierEditorVisible')
	};
}

Wrapper = connect(mapStateToProps)(Wrapper);

export default Wrapper;
