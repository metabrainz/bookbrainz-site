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


const {
	extractAttribute, getEditionPublishers, getEditionReleaseDate,
	getLanguageAttribute
} = entityHelper;
const {getImportUrl} = importHelper;

const {Alert, Col, Row} = bootstrap;

function ImportEditionAttributes({edition}) {
	const status = extractAttribute(edition.editionStatus, 'label');
	const format = extractAttribute(edition.editionFormat, 'label');
	const pageCount = extractAttribute(edition.pages);
	const weight = extractAttribute(edition.weight);
	const width = extractAttribute(edition.width);
	const height = extractAttribute(edition.height);
	const depth = extractAttribute(edition.depth);

	const releaseDate = getEditionReleaseDate(edition);
	const publishers = getEditionPublishers(edition);
	const languages = getLanguageAttribute(edition).data;

	return (
		<div>
			<Row>
				<Col md={3}>
					<dl>
						<dt>Release Date</dt>
						<dd>{releaseDate}</dd>
						<dt>Format</dt>
						<dd>{format}</dd>
						<dt>Status</dt>
						<dd>{status}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Dimensions (WxHxD)</dt>
						<dd>{width}&times;{height}&times;{depth} mm</dd>
						<dt>Weight</dt>
						<dd>{weight} g</dd>
						<dt>Page Count</dt>
						<dd>{pageCount}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Languages</dt>
						<dd>{languages}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Publishers</dt>
						<dd>
							{publishers}
						</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
ImportEditionAttributes.displayName = 'EditionAttributes';
ImportEditionAttributes.propTypes = {
	edition: PropTypes.object.isRequired
};


function ImportEditionDisplayPage({importEntity, identifierTypes}) {
	const urlPrefix = getImportUrl(importEntity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon="book"
						imageUrl={importEntity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<ImportTitle importEntity={importEntity}/>
					<ImportEditionAttributes edition={importEntity}/>
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
ImportEditionDisplayPage.displayName = 'ImportEditionDisplayPage';
ImportEditionDisplayPage.propTypes = {
	identifierTypes: PropTypes.array,
	importEntity: PropTypes.object.isRequired
};
ImportEditionDisplayPage.defaultProps = {
	identifierTypes: []
};

export default ImportEditionDisplayPage;
