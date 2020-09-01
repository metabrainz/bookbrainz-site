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
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';


const {deletedEntityMessage, extractAttribute, getTypeAttribute, getEntityUrl,
	ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias, transformISODateForDisplay} = entityHelper;
const {Col, Row} = bootstrap;

function PublisherAttributes({publisher}) {
	if (publisher.deleted) {
		return deletedEntityMessage;
	}
	const type = getTypeAttribute(publisher.publisherType).data;
	const area = extractAttribute(publisher.area, 'name');
	const beginDate = transformISODateForDisplay(extractAttribute(publisher.beginDate));
	const endDate = transformISODateForDisplay(extractAttribute(publisher.endDate));
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(publisher);
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
						<dt>Area</dt>
						<dd>{area}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Date Founded</dt>
						<dd>{beginDate}</dd>
						<dt>Date Dissolved</dt>
						<dd>{endDate}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
PublisherAttributes.displayName = 'PublisherAttributes';
PublisherAttributes.propTypes = {
	publisher: PropTypes.object.isRequired
};


function PublisherDisplayPage({entity, identifierTypes, user}) {
	const urlPrefix = getEntityUrl(entity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Publisher}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<EntityTitle entity={entity}/>
					<PublisherAttributes publisher={entity}/>
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
PublisherDisplayPage.displayName = 'PublisherDisplayPage';
PublisherDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired
};
PublisherDisplayPage.defaultProps = {
	identifierTypes: []
};

export default PublisherDisplayPage;
