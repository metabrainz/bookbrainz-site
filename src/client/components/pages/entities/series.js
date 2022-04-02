/*
 * Copyright (C) 2021  Akash Gupta
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
import {getEntityKey, getEntityTable} from '../../../helpers/utils';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityRelatedCollections from './related-collections';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';


const {deletedEntityMessage, getEntityUrl, ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias} = entityHelper;
const {Col, Row} = bootstrap;

function SeriesAttributes({series}) {
	if (series.deleted) {
		return deletedEntityMessage;
	}
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(series);
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
						<dt>Series Type</dt>
						<dd>{series.entityType}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						<dt>Ordering Type</dt>
						<dd>{series.seriesOrderingType.label}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						<dt>Total Items</dt>
						<dd>{series.seriesItems.length}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
SeriesAttributes.displayName = 'SeriesAttributes';
SeriesAttributes.propTypes = {
	series: PropTypes.object.isRequired
};


function SeriesDisplayPage({entity, identifierTypes, user}) {
	const urlPrefix = getEntityUrl(entity);
	const EntityTable = getEntityTable(entity.entityType);
	const entityKey = getEntityKey(entity.entityType);
	const propsForTable = {
		[entityKey]: entity.seriesItems,
		showAdd: false,
		showAddedAtColumn: false,
		showCheckboxes: false
	};
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" lg={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Series}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col lg={10}>
					<EntityTitle entity={entity}/>
					<SeriesAttributes series={entity}/>
				</Col>
			</Row>
			<EntityAnnotation entity={entity}/>

			{!entity.deleted &&
			<React.Fragment>
				<EntityTable {...propsForTable}/>
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
SeriesDisplayPage.displayName = 'SeriesDisplayPage';
SeriesDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired
};
SeriesDisplayPage.defaultProps = {
	identifierTypes: []
};

export default SeriesDisplayPage;
