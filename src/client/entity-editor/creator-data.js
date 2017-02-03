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
import {Panel} from 'react-bootstrap';
import React from 'react';
import SubmissionSection from './submission-section/submission-section';
import {connect} from 'react-redux';

/**
 * Container component. Renders all of the sections of the entity editing form
 * for creators.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.aliasEditorVisible - Whether the alias editor modal
 *        should be made visible.
 * @param {boolean} props.identifierEditorVisible - Whether the identifier
 *        editor modal should be made visible.
 * @param {Array} props.languageOptions - The list of possible languages for
 *        language selection fields.
 * @param {Array} props.genderOptions - The list of possible genders for gender
 *        selection fields.
 * @param {Array} props.identifierTypes - The list of possible identifier types
 *        for identifier type selection fields.
 * @param {Array} props.creatorTypes - The list of possible creator types for
 *        creator type selection fields.
 * @param {string} props.submissionUrl - The URL to send the form data to upon
 *        submission.
 * @returns {ReactElement} React element containing the rendered CreatorData.
 */
const CreatorData = ({
	aliasEditorVisible,
	identifierEditorVisible,
	languageOptions,
	genderOptions,
	identifierTypes,
	creatorTypes,
	submissionUrl
}) => {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		label: language.name,
		value: language.id
	}));

	const genderOptionsForDisplay = genderOptions.map((gender) => ({
		label: gender.name,
		value: gender.id
	}));

	const creatorTypesForDisplay = creatorTypes.map((type) => ({
		label: type.label,
		value: type.id
	}));

	return (
		<Panel>
			<AliasEditor
				languageOptions={languageOptionsForDisplay}
				show={aliasEditorVisible}
			/>
			<NameSection languageOptions={languageOptionsForDisplay}/>
			<ButtonBar/>
			<CreatorSection
				creatorTypes={creatorTypesForDisplay}
				genderOptions={genderOptionsForDisplay}
			/>
			<SubmissionSection submissionUrl={submissionUrl}/>
			<IdentifierEditor
				show={identifierEditorVisible}
				typeOptions={identifierTypes}
			/>
		</Panel>
	);
};
CreatorData.displayName = 'CreatorData';
CreatorData.propTypes = {
	aliasEditorVisible: React.PropTypes.bool,
	creatorTypes: React.PropTypes.array,
	genderOptions: React.PropTypes.array,
	identifierEditorVisible: React.PropTypes.array,
	identifierTypes: React.PropTypes.array,
	languageOptions: React.PropTypes.array,
	submissionUrl: React.PropTypes.string
};

function mapStateToProps(rootState) {
	const state = rootState.get('buttonBar');
	return {
		aliasEditorVisible: state.get('aliasEditorVisible'),
		identifierEditorVisible: state.get('identifierEditorVisible')
	};
}

export default connect(mapStateToProps)(CreatorData);
