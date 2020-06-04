/*
 * Copyright (C) 2017  Ben Ockmore
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

import * as bootstrap from 'react-bootstrap';
import * as entityHelper from '../../../helpers/entity';

import EditionTable from './edition-table';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';


const {deletedEntityMessage, getRelationshipSourceByTypeId, getLanguageAttribute, getTypeAttribute, getEntityUrl,
	ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias} = entityHelper;
const {Col, Row} = bootstrap;


function WorkAttributes({work}) {
	if (work.deleted) {
		return deletedEntityMessage;
	}
	const type = getTypeAttribute(work.workType).data;
	const languages = getLanguageAttribute(work).data;
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(work);
	return (
		<div>
			<Row>
				<Col md={3}>
					<dl>
						<dt>Sort Name</dt>
						<dd>{sortNameOfDefaultAlias}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Type</dt>
						<dd>{type}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Language</dt>
						<dd>{languages}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
WorkAttributes.displayName = 'WorkAttributes';
WorkAttributes.propTypes = {
	work: PropTypes.object.isRequired
};


function WorkDisplayPage({entity, identifierTypes}) {
	// relationshipTypeId = 10 refers the relation (<Work> is contained by <Edition>)
	const relationshipTypeId = 10;
	const editionsContainWork = getRelationshipSourceByTypeId(entity, relationshipTypeId);
	const urlPrefix = getEntityUrl(entity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Work}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<EntityTitle entity={entity}/>
					<WorkAttributes work={entity}/>
				</Col>
			</Row>
			{!entity.deleted &&
			<React.Fragment>
				<EditionTable
					editions={editionsContainWork}
					entity={entity}
				/>
				<EntityLinks
					entity={entity}
					identifierTypes={identifierTypes}
					urlPrefix={urlPrefix}
				/>
			</React.Fragment>}
			<hr className="margin-top-d40"/>
			<EntityFooter
				bbid={entity.bbid}
				deleted={entity.deleted}
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
			/>
		</div>
	);
}
WorkDisplayPage.displayName = 'WorkDisplayPage';
WorkDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array
};
WorkDisplayPage.defaultProps = {
	identifierTypes: []
};

export default WorkDisplayPage;
