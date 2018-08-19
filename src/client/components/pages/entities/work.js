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
import EntityLinks from './links';
import EntityRelationships from './relationships';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';


const {getLanguageAttribute, getTypeAttribute, getEntityUrl} = entityHelper;
const {Col, Row} = bootstrap;


export function WorkAttributes({work}) {
	const type = getTypeAttribute(work.workType).data;
	const languages = getLanguageAttribute(work).data;

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
	const urlPrefix = getEntityUrl(entity);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon="file-text-o"
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<EntityTitle entity={entity}/>
					<WorkAttributes work={entity}/>
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
WorkDisplayPage.displayName = 'WorkDisplayPage';
WorkDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array
};
WorkDisplayPage.defaultProps = {
	identifierTypes: []
};

export default WorkDisplayPage;
