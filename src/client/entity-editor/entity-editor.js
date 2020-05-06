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

import * as React from 'react';
import AliasEditor from './alias-editor/alias-editor';
import ButtonBar from './button-bar/button-bar';
import IdentifierEditor from './identifier-editor/identifier-editor';
import NameSection from './name-section/name-section';
import {Panel} from 'react-bootstrap';
import RelationshipSection from './relationship-editor/relationship-section';
import SubmissionSection from './submission-section/submission-section';
import {connect} from 'react-redux';


type OwnProps = {
	children: React.Element<any>
};

type StateProps = {
	aliasEditorVisible: boolean,
	identifierEditorVisible: boolean
};

type Props = StateProps & OwnProps;

/**
 * Container component. Renders all of the sections of the entity editing form.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.aliasEditorVisible - Whether the alias editor modal
 *        should be made visible.
 * @param {boolean} props.identifierEditorVisible - Whether the identifier
 *        editor modal should be made visible.
 * @param {React.Node} props.children - The child content to wrap with this
 *        entity editor form.
 * @returns {ReactElement} React element containing the rendered EntityEditor.
 */
const EntityEditor = (props: Props) => {
	const {
		aliasEditorVisible,
		children,
		heading,
		identifierEditorVisible
	} = props;

	return (
		<Panel>
			<Panel.Heading>
				<Panel.Title componentClass="h3">
					{heading}
				</Panel.Title>
			</Panel.Heading>
			<Panel.Body>
				<AliasEditor show={aliasEditorVisible} {...props}/>
				<NameSection {...props}/>
				<ButtonBar {...props}/>
				<RelationshipSection {...props}/>
				{
					React.cloneElement(
						React.Children.only(children),
						{...props}
					)
				}
				<IdentifierEditor show={identifierEditorVisible} {...props}/>
			</Panel.Body>
			<Panel.Footer>
				<SubmissionSection {...props}/>
			</Panel.Footer>
		</Panel>
	);
};
EntityEditor.displayName = 'EntityEditor';

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('buttonBar');
	return {
		aliasEditorVisible: state.get('aliasEditorVisible'),
		identifierEditorVisible: state.get('identifierEditorVisible')
	};
}

export default connect(mapStateToProps)(EntityEditor);
