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
import AuthorCreditDisplay from '../../author-credit-display';
import EditionTable from './edition-table';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityRelatedCollections from './related-collections';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';


const {deletedEntityMessage, getTypeAttribute, getEntityUrl, ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias} = entityHelper;
const {Col, Row} = bootstrap;

function EditionGroupAttributes({editionGroup}) {
	if (editionGroup.deleted) {
		return deletedEntityMessage;
	}
	const type = getTypeAttribute(editionGroup.editionGroupType).data;
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(editionGroup);
	return (
		<div>
			<Row>
				<Col lg={3}>
					<dl>
						<dt>Sort Name</dt>
						<dd>{sortNameOfDefaultAlias}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						<dt>Type</dt>
						<dd>{type}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
EditionGroupAttributes.displayName = 'EditionGroupAttributes';
EditionGroupAttributes.propTypes = {
	editionGroup: PropTypes.object.isRequired
};


function EditionGroupDisplayPage({entity, identifierTypes, user}) {
	const urlPrefix = getEntityUrl(entity);

	let authorCreditSection;
	if (entity.authorCredit) {
		authorCreditSection = (
			<AuthorCreditDisplay
				names={entity.authorCredit.names}
			/>
		);
	}
	else if (!entity.deleted) {
		authorCreditSection = (
			<div className="alert alert-warning text-center">
				Author Credit unset; please&nbsp;
				<a href={`/edition-group/${entity.bbid}/edit`}>edit this Edition Group</a>&nbsp;
				and add its Author(s) if you see this!
				You can copy the Author Credit from one of the Editions as well
			</div>);
	}

	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" lg={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.EditionGroup}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col lg={10}>
					<EntityTitle entity={entity}/>
					{authorCreditSection}
					<EditionGroupAttributes editionGroup={entity}/>
				</Col>
			</Row>
			<EntityAnnotation entity={entity}/>
			{!entity.deleted &&
			<React.Fragment>
				<EditionTable editions={entity.editions} entity={entity}/>
				<EntityLinks
					entity={entity}
					identifierTypes={identifierTypes}
					urlPrefix={urlPrefix}
				/>
				<EntityRelatedCollections collections={entity.collections}/>
			</React.Fragment>}
			<hr className="margin-top-d40"/>
			<EntityFooter
				bbid={entity.bbid}
				deleted={entity.deleted}
				entityType={entity.type}
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
				user={user}
			/>
		</div>
	);
}
EditionGroupDisplayPage.displayName = 'EditionGroupDisplayPage';
EditionGroupDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired
};
EditionGroupDisplayPage.defaultProps = {
	identifierTypes: []
};

export default EditionGroupDisplayPage;
