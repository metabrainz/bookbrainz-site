/*
 * Copyright (C) 2018 Shivam Tripathi
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
import * as importHelper from '../../../helpers/import-entity';

import EntityImage from '../entities/image';
import EntityLinks from '../entities/links';
import ImportFooter from './footer';
import ImportTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';


const {extractAttribute, getTypeAttribute} = entityHelper;
const {getImportUrl} = importHelper;

const {Alert, Col, Row} = bootstrap;


function ImportCreatorAttributes({creator}) {
	const type = getTypeAttribute(creator.creatorType).data;
	const gender = extractAttribute(creator.gender, 'name');
	const beginArea = extractAttribute(creator.beginArea, 'name');
	const endArea = extractAttribute(creator.endArea, 'name');
	const beginDate = extractAttribute(creator.beginDate);
	const endDate = extractAttribute(creator.endDate);

	return (
		<div>
			<Row>
				<Col md={3}>
					<dl>
						<dt>Type</dt>
						<dd>{type}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Gender</dt>
						<dd>{gender}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Begin Date</dt>
						<dd>{beginDate}</dd>
						<dt>Begin Area</dt>
						<dd>{beginArea}</dd>
					</dl>
				</Col>
				{
					creator.ended &&
					<Col md={3}>
						<dl>
							<dt>End Date</dt>
							<dd>{endDate}</dd>
							<dt>End Area</dt>
							<dd>{endArea}</dd>
						</dl>
					</Col>
				}
			</Row>
		</div>
	);
}
ImportCreatorAttributes.displayName = 'CreatorAttributes';
ImportCreatorAttributes.propTypes = {
	creator: PropTypes.object.isRequired
};


function ImportCreatorDisplayPage({importEntity, identifierTypes}) {
	const urlPrefix = getImportUrl(importEntity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon="user"
						imageUrl={importEntity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<ImportTitle importEntity={importEntity}/>
					<ImportCreatorAttributes creator={importEntity}/>
				</Col>
			</Row>
			<EntityLinks
				entity={importEntity}
				identifierTypes={identifierTypes}
				urlPrefix={urlPrefix}
			/>
			<hr className="margin-top-d40"/>
			<Row>
				<Alert
					bsStyle="success"
					className="text-center"
					style={{fontWeight: 'bold'}}
				>
					{`This ${_.startCase(importEntity.type.toLowerCase())} `}
					{'has been automatically added. Kindly approve/discard it '}
					{'to help us improve our data.'}
				</Alert>
			</Row>
			<ImportFooter
				hasVoted={importEntity.hasVoted}
				importUrl={urlPrefix}
				importedAt={importEntity.importedAt}
				source={importEntity.source}
			/>
		</div>
	);
}
ImportCreatorDisplayPage.displayName = 'ImportCreatorDisplayPage';
ImportCreatorDisplayPage.propTypes = {
	identifierTypes: PropTypes.array,
	importEntity: PropTypes.object.isRequired
};
ImportCreatorDisplayPage.defaultProps = {
	identifierTypes: []
};

export default ImportCreatorDisplayPage;
