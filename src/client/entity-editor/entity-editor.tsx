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

import * as React from 'react';
import {connect, useSelector} from 'react-redux';
import AliasEditor from './alias-editor/alias-editor';
import AnnotationSection from './annotation-section/annotation-section';
import ButtonBar from './button-bar/button-bar';
import IdentifierEditor from './identifier-editor/identifier-editor';
import NameSection from './name-section/name-section';
import {Panel} from 'react-bootstrap';
import RelationshipSection from './relationship-editor/relationship-section';
import SubmissionSection from './submission-section/submission-section';
import {convertMapToObject} from '../helpers/utils';
import {submit} from './submission-section/actions';


type OwnProps = {
	children: React.ReactElement<any>,
	heading: string
};

type StateProps = {
	aliasEditorVisible: boolean,
	identifierEditorVisible: boolean,
};

type DispatchProps = {
	onSubmit: () => unknown
};

type Props = StateProps & DispatchProps & OwnProps;

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
 * @param {Function} props.onSubmit - A function to be called when the
 *        submit button is clicked.
 * @returns {ReactElement} React element containing the rendered EntityEditor.
 */
const EntityEditor = (props: Props) => {
	const {
		aliasEditorVisible,
		children,
		heading,
		identifierEditorVisible,
		onSubmit
	} = props;
	const [initialValues, setinitialValues] = React.useState({});
	const rootState = useSelector(state => state);

	function getFormValues(rState) {
		const state = rState.get('nameSection');
		const editionSectionState = rState.get('editionSection');
		const searchForExistingEditionGroup =
			Boolean(editionSectionState) &&
			(!editionSectionState.get('editionGroup') ||
				editionSectionState.get('editionGroupRequired'));
		return {
			...convertMapToObject(rState.get('annotationSection')),
			disambiguationDefaultValue: state.get('disambiguation'),
			exactMatches: state.get('exactMatches'),
			identifiers: state.get('identifierEditor'),
			languageValue: state.get('language'),
			nameValue: state.get('name'),
			numAliases: rState.get('aliasEditor').size,
			relationships: rState.get('relationshipSection').get('relationships'),
			searchForExistingEditionGroup,
			searchResults: state.get('searchResults'),
			sortNameValue: state.get('sortName')
		};
	}

	function hasFormChanged() {
		const currentFormValues = getFormValues(rootState);
		for (const key in currentFormValues) {
			if (['relationships', 'identifiers'].includes(key)) {
				if (currentFormValues[key] !== initialValues[key]) {
					return true;
				}
			}
			else if (JSON.stringify(currentFormValues[key]) !== JSON.stringify(initialValues[key])) {
				return true;
			}
		}

		return false;
	}
	// eslint-disable-next-line consistent-return
	const handleUrlChange = () => {
		if (hasFormChanged()) {
			return '';
		}
	};
	React.useEffect(() => {
		setinitialValues(getFormValues(rootState));
		window.onbeforeunload = handleUrlChange;
	}, []);
	return (
		<form onSubmit={onSubmit}>
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
					{
						React.cloneElement(
							React.Children.only(children),
							{...props}
						)
					}
					<RelationshipSection {...props}/>
					<IdentifierEditor show={identifierEditorVisible} {...props}/>
					<AnnotationSection {...props}/>
				</Panel.Body>
				<Panel.Footer>
					<SubmissionSection {...props}/>
				</Panel.Footer>
			</Panel>
		</form>
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

function mapDispatchToProps(dispatch, {submissionUrl}) {
	return {
		onSubmit: (event:React.FormEvent) => {
			event.preventDefault();
			dispatch(submit(submissionUrl));
		}
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityEditor);
