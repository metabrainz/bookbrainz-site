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
import {Card} from 'react-bootstrap';
import IdentifierEditor from './identifier-editor/identifier-editor';
import NameSection from './name-section/name-section';
import RelationshipSection from './relationship-editor/relationship-section';
import SubmissionSection from './submission-section/submission-section';
import _ from 'lodash';
import {getEntityUrl} from '../helpers/entity';
import {submit} from './submission-section/actions';


type OwnProps = {
	children: React.ReactElement<any>,
	heading: string,
	intitialState:Record<string, any>,
	entity: any
};

type StateProps = {
	aliasEditorVisible: boolean,
	identifierEditorVisible: boolean,
};

type DispatchProps = {
	onSubmit: (event:React.FormEvent) => unknown
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
		onSubmit,
		entity
	} = props;
	const currentState = (useSelector((state) => state) as any).toJS();
	let entityURL;
	// eslint-disable-next-line consistent-return
	const handleUrlChange = React.useCallback(() => {
		if (!_.isEqual(currentState, props.intitialState) && !currentState.submissionSection.submitted) {
			return 'You have some unsaved changes!';
		}
	}, [currentState]);
	React.useEffect(() => {
		window.onbeforeunload = handleUrlChange;
	}, [handleUrlChange]);

	if (entity) {
		entityURL = getEntityUrl(entity);
	}

	return (
		<form onSubmit={onSubmit}>
			<Card>
				<Card.Header as="h4">
					<div>
					 {entityURL ? <a href={entityURL}>{heading}</a> : heading}
					</div>
				</Card.Header>
				<Card.Body>
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
				</Card.Body>
				<Card.Footer>
					<SubmissionSection {...props}/>
				</Card.Footer>
			</Card>
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
