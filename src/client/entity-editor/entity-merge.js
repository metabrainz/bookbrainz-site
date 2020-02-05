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

import {Col, Row} from 'react-bootstrap';

import AliasEditorMerge from './alias-editor/alias-editor-merge';
import Entity from './common/entity';
import EntityIdentifiers from '../components/pages/entities/identifiers';
import NameSectionMerge from './name-section/name-section-merge';
import RelationshipSection from './relationship-editor/relationship-section';
import SubmissionSection from './submission-section/submission-section';
import _ from 'lodash';
import {connect} from 'react-redux';
import {getEntityLink} from '../../server/helpers/utils';


type OwnProps = {
	children: React.Element<any>
};

type StateProps = {
	aliasEditorVisible: boolean,
	identifierEditorVisible: boolean,
	relationshipsArray: object
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
 * @returns {ReactElement} React element containing the rendered EntityMerge.
 */
const EntityMerge = (props: Props) => {
	const {
		children,
		mergingEntities,
		identifierSet,
		subheading
	} = props;
	const identifiers = _.values(identifierSet.toJS()) || [];
	return (
		<div>
			<div>
				{subheading}
				<div>
					<div className="small margin-bottom-1">
						{mergingEntities.map((entity, index) => {
							const entityForDisplay = {
								link: getEntityLink({bbid: entity.bbid, type: entity.type}),
								text: _.get(entity, ['defaultAlias', 'name']),
								type: entity.type,
								unnamedText: '(unnamed)'
							};
							const isNotLast = index < mergingEntities.length - 1;
							return (
								<span className={isNotLast ? 'margin-right-d5' : ''} key={entity.bbid}>
									<Entity {...entityForDisplay}/>
									{isNotLast && '⟸'}
								</span>
							);
						})}
					</div>
					Select and review the data to merge.
					For further modifications, edit the resulting merged entity.
				</div>
			</div>
			<div>
				<Row>
					<Col md={5} mdOffset={1}>
						<NameSectionMerge {...props}/>
					</Col>
					<Col md={5} mdOffset={1}>
						<AliasEditorMerge {...props}/>
					</Col>
				</Row>
				<Row>
					<Col md={5} mdOffset={1}>
						{
							React.cloneElement(
								React.Children.only(children),
								{...props}
							)
						}
					</Col>
				</Row>
				<Row>
					<Col md={8}>
						<RelationshipSection {...props}/>
					</Col>
					<Col md={4}>
						<EntityIdentifiers
							identifierTypes={props.identifierTypes}
							identifiers={identifiers}
						/>
					</Col>
				</Row>
			</div>
			<div>
				<SubmissionSection {...props}/>
			</div>
		</div>
	);
};
EntityMerge.displayName = 'EntityMerge';

function mapStateToProps(rootState): StateProps {
	return {
		identifierSet: rootState.get('identifierEditor', {})
	};
}

export default connect(mapStateToProps)(EntityMerge);
