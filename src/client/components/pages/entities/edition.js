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
import EntityIdentifiers from './identifiers';
import EntityImage from './image';
import EntityRelationships from './relationships';
import EntityTitle from './title';
import Icon from 'react-fontawesome';
import React from 'react';

const {
	extractAttribute, getEditionPublishers, getEditionReleaseDate, getEntityUrl,
	getLanguageAttribute
} = entityHelper;
const {Col, Row} = bootstrap;

function EditionAttributes({edition}) {
	const status = extractAttribute(edition.editionStatus, 'label');
	const format = extractAttribute(edition.editionFormat, 'label');
	const pageCount = extractAttribute(edition.pages);
	const weight = extractAttribute(edition.weight);
	const width = extractAttribute(edition.width);
	const height = extractAttribute(edition.height);
	const depth = extractAttribute(edition.depth);

	const releaseDate = getEditionReleaseDate(edition);
	const publishers = getEditionPublishers(edition);

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
						<dd>{getLanguageAttribute(edition).data}</dd>
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
EditionAttributes.displayName = 'EditionAttributes';
EditionAttributes.propTypes = {
	edition: React.PropTypes.object.isRequired
};


function EditionDisplayPage({entity, identifierTypes}) {
	const urlPrefix = getEntityUrl(entity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="text-center" md={2}>
					<EntityImage backupIcon="book" imageUrl={entity.imageUrl}/>
				</Col>
				<Col md={10}>
					<EntityTitle entity={entity}/>
					<EditionAttributes edition={entity}/>
					<div className="margin-bottom-d15">
						<a href={`/publication/${entity.publication.bbid}`}>
							<Icon name="external-link"/>
							<span>&nbsp;See all other editions</span>
						</a>
					</div>
				</Col>
			</Row>
			<Row>
				<Col md={8}>
					<EntityRelationships relationships={entity.relationships}/>
				</Col>
				<Col md={4}>
					<EntityIdentifiers
						identifierSet={entity.identifierSet}
						identifierTypes={identifierTypes}
					/>
				</Col>
			</Row>
			<hr className="margin-top-d40"/>
			<EntityFooter
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
			/>
		</div>
	);
}
EditionDisplayPage.displayName = 'EditionDisplayPage';
EditionDisplayPage.propTypes = {
	entity: React.PropTypes.object.isRequired,
	identifierTypes: React.PropTypes.array.isRequired
};

export default EditionDisplayPage;
