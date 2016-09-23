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
import CreatorData from './creator-data/creator-data';
import {Panel} from 'react-bootstrap';
import React from 'react';
import SharedData from './shared-data/shared-data';
import {connect} from 'react-redux';


let Wrapper = ({
	aliasEditorVisible,
	disambiguationVisible,
	languageOptions
}) => {
	const languageOptionsForDisplay = languageOptions.map((language) => ({
		value: language.id,
		label: language.name
	}));

	return (
		<Panel>
			<AliasEditor
				languageOptions={languageOptionsForDisplay}
				show={aliasEditorVisible}
			/>
			<SharedData
				disambiguationVisible={disambiguationVisible}
				languageOptions={languageOptionsForDisplay}
			/>
			<CreatorData/>
		</Panel>
	);
};
Wrapper.displayName = 'Wrapper';
Wrapper.propTypes = {
	aliasEditorVisible: React.PropTypes.bool,
	disambiguationVisible: React.PropTypes.bool,
	languageOptions: React.PropTypes.array
};

function mapStateToProps(rootState) {
	const state = rootState.get('sharedData');
	return {
		disambiguationVisible: state.get('disambiguationVisible'),
		aliasEditorVisible: state.get('aliasEditorVisible')
	};
}

Wrapper = connect(mapStateToProps)(Wrapper);

export default Wrapper;
