/*
 * Copyright (C) 2017  Eshan Singh
 *               2022  Ansh Goyal
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


const {filterOutRelationshipTypeById} = entityHelper;
const {Row, Col} = bootstrap;

function EntityLinks({entity, identifierTypes, urlPrefix}) {
	// relationshipTypeId = 10 refers the relation (<Work> is contained by <Edition>)
	const relationshipTypeId = 10;
	const relationships = filterOutRelationshipTypeById(entity, relationshipTypeId);
	return (
		<React.Fragment>
			<Row>
				<Col>
					<EntityRelationships
						contextEntity={entity}
						entityUrl={urlPrefix}
						relationships={relationships}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<EntityIdentifiers
						entityUrl={urlPrefix}
						identifierTypes={identifierTypes}
						identifiers={entity.identifierSet && entity.identifierSet.identifiers}
					/>
				</Col>
			</Row>
		</React.Fragment>
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
