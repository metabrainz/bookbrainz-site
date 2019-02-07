/*
 * Copyright (C) 2017  Eshan Singh
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

import EntityIdentifiers from './identifiers';
import EntityRelationships from './relationships';
import PropTypes from 'prop-types';
import React from 'react';


const {getFilteredRelationship} = entityHelper;
const {Col, Row} = bootstrap;

function EntityLinks({entity, identifierTypes, urlPrefix}) {
	const relationships = getFilteredRelationship(entity);
	return (
		<Row>
			<Col md={8}>
				<EntityRelationships
					entityUrl={urlPrefix}
					relationships={relationships}
				/>
			</Col>
			<Col md={4}>
				<EntityIdentifiers
					identifierSet={entity.identifierSet}
					identifierTypes={identifierTypes}
				/>
			</Col>
		</Row>
	);
}
EntityLinks.displayName = 'EntityLinks';
EntityLinks.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	urlPrefix: PropTypes.string.isRequired
};
EntityLinks.defaultProps = {
	identifierTypes: []
};

export default EntityLinks;
