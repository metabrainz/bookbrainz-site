/*
 * Copyright (C) 2019  Nicolas Pelletier
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

import {Card, Col, Row} from 'react-bootstrap';

import AliasEditorMerge from './alias-editor/alias-editor-merge';
import AnnotationSection from './annotation-section/annotation-section';
import Entity from './common/entity';
import EntityIdentifiers from '../components/pages/entities/identifiers';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NameSectionMerge from './name-section/name-section-merge';
import RelationshipSection from './relationship-editor/relationship-section';
import SubmissionSection from './submission-section/submission-section';
import _ from 'lodash';
import {connect} from 'react-redux';
import {faAngleDoubleLeft} from '@fortawesome/free-solid-svg-icons';
import {getEntityLink} from '../../common/helpers/utils';
import {submit} from './submission-section/actions';


type OwnProps = {
	children: React.ReactElement<any>,
	mergingEntities: any[],
	identifierTypes: Array<any>,
	subheading: string
};

type StateProps = {
	identifierSet: any
};

type DispatchProps = {
	onSubmit: () => unknown
};

type Props = StateProps & OwnProps & DispatchProps;

/**
 * Container component. Renders all of the sections of the entity editing form.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.Node} props.children - The child content to wrap with this
 *        entity editor form.
 * @param {Array} props.mergingEntities - An array of entities that are being merge
 * @param {boolean} props.identifierSet - Concatenated identifiers from entities in merging
 * @param {boolean} props.identifierTypes - possible identifier types for this entity type
 * @param {string} props.subheading - Subheading at the top of the html page
 * @param {Function} props.onSubmit - A function to be called when the
 *        submit button is clicked.
 * @returns {ReactElement} React element containing the rendered EntityMerge.
 */
const EntityMerge = (props: Props) => {
	const {
		children,
		mergingEntities,
		identifierSet,
		identifierTypes,
		subheading,
		onSubmit
	} = props;
	const identifiers = _.values(identifierSet.toJS()) || [];
	return (
		<form onSubmit={onSubmit}>
			<Card>
				<Card.Header as="h4">
					<p>{subheading}</p>
					<div>
						{mergingEntities.map((entity, index) => {
							const entityForDisplay = {
								link: getEntityLink({bbid: entity.bbid, type: entity.type}),
								text: _.get(entity, ['defaultAlias', 'name']),
								type: entity.type,
								unnamedText: '(unnamed)'
							};
							const isNotLast = index < mergingEntities.length - 1;
							return (
								<span key={entity.bbid}>
									<Entity {...entityForDisplay}/>
									{isNotLast && <FontAwesomeIcon className="margin-sides-d5" icon={faAngleDoubleLeft}/>}
								</span>
							);
						})}
					</div>
				</Card.Header>
				<Card.Body>
					<p className="alert alert-info">
						You are merging into entity {mergingEntities[0].bbid}. If you want to merge into another entity instead,
						you can select the correct entity in the merge queue at the bottom of the page and click
						the <i>Merge into selected entity</i> button again.
						This will reload the page with the new merge target selected.
					</p>
					<p className="text-muted">
					Select and review the data to merge.
					For further modifications, edit the resulting merged entity.
					</p>
					<div>
						<Row>
							<Col lg={{offset: 1, span: 5}}>
								<NameSectionMerge {...props}/>
							</Col>
							<Col lg={{offset: 1, span: 5}}>
								<AliasEditorMerge {...props}/>
							</Col>
						</Row>
						<Row>
							<Col lg={{offset: 1, span: 5}}>
								{
									React.cloneElement(
										React.Children.only(children),
										{...props}
									)
								}
							</Col>
						</Row>
						<Row>
							<Col lg={8}>
								<RelationshipSection {...props}/>
							</Col>
							<Col lg={4}>
								<EntityIdentifiers
									identifierTypes={identifierTypes}
									identifiers={identifiers}
								/>
							</Col>
						</Row>
						<AnnotationSection {...props}/>
					</div>
				</Card.Body>
				<Card.Footer>
					<div>
						<SubmissionSection {...props}/>
					</div>
				</Card.Footer>
			</Card>
		</form>
	);
};
EntityMerge.displayName = 'EntityMerge';

function mapStateToProps(rootState): StateProps {
	return {
		identifierSet: rootState.get('identifierEditor', {})
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

export default connect(mapStateToProps, mapDispatchToProps)(EntityMerge);
