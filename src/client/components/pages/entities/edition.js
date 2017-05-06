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
import EntityRelationships from './relationships';
import Icon from 'react-fontawesome';
import React from 'react';

const {extractAttribute, getLanguageAttribute} = entityHelper;
const {
	Button, Col, Image, Row
} = bootstrap;


function EditionDisplayPage({entity, identifierTypes}) {
	let entityLabel = null;
	if (entity.revision.dataId) {
		entityLabel = entity.defaultAlias ?
			`${entity.defaultAlias.name} ` :
				'(unnamed)';
	}
	else {
		entityLabel = `${entity.type} ${entity.bbid}`;
	}
	const editionStatus = extractAttribute(entity.editionStatus, 'label');
	const editionFormat = extractAttribute(entity.editionFormat, 'label');
	const releaseDate = (entity.releaseEventSet &&
	entity.releaseEventSet.releaseEvents &&
	entity.releaseEventSet.releaseEvents.length) ?
		entity.releaseEventSet.releaseEvents[0].date :
		'?';
	const pageCount = extractAttribute(entity.pages);
	const weight = extractAttribute(entity.weight);
	const width = extractAttribute(entity.width);
	const height = extractAttribute(entity.height);
	const depth = extractAttribute(entity.depth);
	const publishers =
		(entity.publisherSet && entity.publisherSet.publishers.length > 0) ?
			entity.publisherSet.publishers.map((publisher) =>
				<a
					href={`/publisher/${publisher.bbid}`}
					key={publisher.bbid}
				>
					{publisher.defaultAlias.name}
				</a>
			) : '?';

	const identifiers = entity.identifierSet &&
		identifierTypes.map((type, idx) => {
			const identifierValues =
				entity.identifierSet.identifiers.filter((identifier) =>
					identifier.type.id === type.id
				).map((identifier, index) =>
					<dd
						key={`${identifier.id}${index}`}
					>
						{identifier.value}
					</dd>
				);
			return [
				<dt key={`type${type.id}${idx}`}>{type.label}</dt>,
				identifierValues
			];
		});
	const editUrl =
		`/${entity.type.toLowerCase()}/${entity.bbid}/relationships`;
	const entityType = entity.type.toLowerCase();
	const entityId = entity.bbid;
	const urlPrefix = `/${entityType}/${entityId}`;
	return (
		<div>
			<Row style={{backgroundColor: '#f1edeb'}}>
				<Col className="text-center" md={2}>
					{entity.imageUrl ?
						<Image
							responsive
							className="margin-top-1 margin-bottom-1"
							src={entity.imageUrl}
						/> :
						<Icon
							className="margin-top-1 margin-bottom-1"
							name="book"
							size="5x"
						/>
					}
				</Col>
				<Col md={10}>
					<h1>{entityLabel}
						{entity.disambiguation &&
							<small>
								{`(${entity.disambiguation.comment})`}
							</small>
						}
					</h1>
					<hr/>
					<Row>
						<Col md={3}>
							<dl>
								<dt>Release Date</dt>
								<dd>{releaseDate}</dd>
								<dt>Format</dt>
								<dd>{editionFormat}</dd>
								<dt>Status</dt>
								<dd>{editionStatus}</dd>
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
								<dd>{getLanguageAttribute(entity).data}</dd>
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
					<div style={{marginBottom: '0.5em'}}>
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
					<h2>Identifiers</h2>
					{identifiers}
				</Col>
			</Row>
			<hr className="margin-top-4"/>
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
