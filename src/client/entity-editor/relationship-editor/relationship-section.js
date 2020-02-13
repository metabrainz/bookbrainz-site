/*
 * Copyright (C) 2018  Ben Ockmore
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

import * as Immutable from 'immutable';

import {
	type Action,
	addRelationship,
	editRelationship,
	hideRelationshipEditor,
	removeRelationship,
	showRelationshipEditor,
	undoLastSave
} from './actions';
import {Button, ButtonGroup, Col, Row} from 'react-bootstrap';
import type {
	Entity,
	EntityType,
	RelationshipForDisplay,
	RelationshipType,
	Relationship as _Relationship
} from './types';
import type {Dispatch} from 'redux'; // eslint-disable-line import/named
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import Relationship from './relationship';
import RelationshipEditor from './relationship-editor';
import _ from 'lodash';
import {connect} from 'react-redux';


type RelationshipListProps = {
	contextEntity: Entity,
	relationships: Array<RelationshipForDisplay>,
	onEdit: (number) => mixed,
	onRemove: (number) => mixed
};

function RelationshipList(
	{contextEntity, relationships, onEdit, onRemove}: RelationshipListProps
) {
	/* eslint-disable react/jsx-no-bind */

	const renderedRelationships = _.map(
		relationships,
		({relationshipType, sourceEntity, targetEntity}, rowID) => (
			<Row className="margin-top-d5" key={rowID}>
				<Col md={8}>
					<Relationship
						link
						contextEntity={contextEntity}
						relationshipType={relationshipType}
						sourceEntity={sourceEntity}
						targetEntity={targetEntity}
					/>
				</Col>
				<Col className="text-right" md={4}>
					<ButtonGroup justified>
						<ButtonGroup>
							<Button
								bsStyle="warning"
								onClick={onEdit.bind(this, rowID)}
							>
								<FontAwesomeIcon icon="pencil-alt"/>
								<span>&nbsp;Edit</span>
							</Button>
						</ButtonGroup>
						<ButtonGroup>
							<Button
								bsStyle="danger"
								onClick={onRemove.bind(this, rowID)}
							>
								<FontAwesomeIcon icon="times"/>
								<span>&nbsp;Remove</span>
							</Button>
						</ButtonGroup>
					</ButtonGroup>
				</Col>
			</Row>
		)
	);

	/* eslint-enable react/jsx-no-bind */

	return <div>{renderedRelationships}</div>;
}

type OwnProps = {
	entity: Entity,
	entityType: EntityType,
	relationshipTypes: Array<RelationshipType>,
};

type StateProps = {
	entityName: string,
	relationships: Immutable.List<any>,
	relationshipEditorProps: Immutable.Map<string, any>,
	showEditor: boolean,
	undoPossible: boolean
};

type DispatchProps = {
	onAddRelationship: () => mixed,
	onEditorClose: () => mixed,
	onEditorAdd: (_Relationship) => mixed,
	onEdit: (number) => mixed,
	onRemove: (number) => mixed,
	onUndo: () => mixed
};

type Props = OwnProps & StateProps & DispatchProps;


function RelationshipSection({
	entity, entityType, entityName, languageOptions, showEditor, relationships,
	relationshipEditorProps, relationshipTypes, onAddRelationship,
	onEditorClose, onEditorAdd, onEdit, onRemove, onUndo, undoPossible
}: Props) {
	const baseEntity = {
		bbid: _.get(entity, 'bbid'),
		defaultAlias: {
			name: entityName
		},
		type: _.upperFirst(entityType)
	};

	const languageOptionsForDisplay = languageOptions.map((language) => ({
		label: language.name,
		value: language.id
	}));

	const editor = (
		<RelationshipEditor
			baseEntity={baseEntity}
			initRelationship={
				relationshipEditorProps && relationshipEditorProps.toJS()
			}
			languageOptions={languageOptionsForDisplay}
			relationshipTypes={relationshipTypes}
			onAdd={onEditorAdd}
			onCancel={onEditorClose}
			onClose={onEditorClose}
		/>
	);

	return (
		<div>
			{showEditor && editor}
			<h2>How are other entities related to this {_.startCase(entityType)}?</h2>
			<Row>
				<Col md={10} mdOffset={1}>
					<RelationshipList
						contextEntity={baseEntity}
						relationships={relationships.toJS()}
						onEdit={onEdit}
						onRemove={onRemove}
					/>
				</Col>
			</Row>
			<Row className="margin-top-1">
				<Col
					className="text-center"
					md={4}
					mdOffset={4}
				>
					<Button
						bsStyle="success"
						onClick={onAddRelationship}
					>
						<FontAwesomeIcon icon="plus"/>
						<span>&nbsp;Add relationship</span>
					</Button>
				</Col>
			</Row>
			{undoPossible &&
				<Row className="margin-top-d5">
					<Col
						className="text-center"
						md={4}
						mdOffset={4}
					>
						<Button
							onClick={onUndo}
						>
							Undo last action
						</Button>
					</Col>
				</Row>
			}
		</div>
	);
}

RelationshipSection.displayName = 'RelationshipSection';
RelationshipSection.propTypes = {
	languageOptions: PropTypes.array.isRequired
};

function mapStateToProps(rootState): StateProps {
	const state = rootState.get('relationshipSection');
	return {
		entityName: rootState.getIn(['nameSection', 'name']),
		relationshipEditorProps: state.get('relationshipEditorProps'),
		relationships: state.get('relationships'),
		showEditor: state.get('relationshipEditorVisible'),
		undoPossible: state.get('lastRelationships') !== null
	};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
	return {
		onAddRelationship: () => dispatch(showRelationshipEditor()),
		onEdit: (rowID) => dispatch(editRelationship(rowID)),
		onEditorAdd: (data) => dispatch(addRelationship(data)),
		onEditorClose: () => dispatch(hideRelationshipEditor()),
		onRemove: (rowID) => dispatch(removeRelationship(rowID)),
		onUndo: () => dispatch(undoLastSave())
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(
	RelationshipSection
);
