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

import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';
import {labelsForCreator} from '../../../helpers/utils';


const {extractAttribute, getTypeAttribute, getEntityUrl,
	ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias} = entityHelper;
const {Col, Row} = bootstrap;


function CreatorAttributes({creator}) {
	const type = getTypeAttribute(creator.creatorType).data;
	const gender = extractAttribute(creator.gender, 'name');
	const beginArea = extractAttribute(creator.beginArea, 'name');
	const endArea = extractAttribute(creator.endArea, 'name');
	const beginDate = extractAttribute(creator.beginDate);
	const endDate = extractAttribute(creator.endDate);
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(creator);

	const isGroup = type === 'Group';
	const {
		beginDateLabel,
		beginAreaLabel,
		endDateLabel,
		endAreaLabel
	} = labelsForCreator(isGroup);
	const showGender = !isGroup;
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
						{showGender ?
							<React.Fragment>
								<dt>Gender</dt>
								<dd>{gender}</dd>
							</React.Fragment> : null
						}
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>{beginDateLabel}</dt>
						<dd>{beginDate}</dd>
						<dt>{beginAreaLabel}</dt>
						<dd>{beginArea}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>{endDateLabel}</dt>
						<dd>{endDate}</dd>
						<dt>{endAreaLabel}</dt>
						<dd>{endArea}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
CreatorAttributes.displayName = 'CreatorAttributes';
CreatorAttributes.propTypes = {
	creator: PropTypes.object.isRequired
};


function CreatorDisplayPage({entity, identifierTypes}) {
	const urlPrefix = getEntityUrl(entity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Creator}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<EntityTitle entity={entity}/>
					<CreatorAttributes creator={entity}/>
				</Col>
			</Row>
			<EntityLinks
				entity={entity}
				identifierTypes={identifierTypes}
				urlPrefix={urlPrefix}
			/>
			<hr className="margin-top-d40"/>
			<EntityFooter
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
			/>
		</div>
	);
}
CreatorDisplayPage.displayName = 'CreatorDisplayPage';
CreatorDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array
};
CreatorDisplayPage.defaultProps = {
	identifierTypes: []
};

export default CreatorDisplayPage;
