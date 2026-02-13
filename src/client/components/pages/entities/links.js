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

import EntityRelationships from './relationships';
import PropTypes from 'prop-types';
import React from 'react';


const {filterOutRelationshipTypeById, getRelationshipsByTypeId} = entityHelper;
const {Row, Col} = bootstrap;

function EntityLinks({excludeTypeIds, entity, urlPrefix, label, relationshipTypeIds, buttonHref}) {
	const relationships = excludeTypeIds ?
		filterOutRelationshipTypeById(entity, relationshipTypeIds) :
		getRelationshipsByTypeId(entity, relationshipTypeIds);

	return (
		<React.Fragment>
			<Row>
				<Col>
					<EntityRelationships
						buttonHref={buttonHref}
						contextEntity={entity}
						entityUrl={urlPrefix}
						label={label}
						relationships={relationships}
					/>
				</Col>
			</Row>
		</React.Fragment>
	);
}
EntityLinks.displayName = 'EntityLinks';
EntityLinks.propTypes = {
	buttonHref: PropTypes.string,
	entity: PropTypes.object.isRequired,
	excludeTypeIds: PropTypes.bool,
	label: PropTypes.string,
	relationshipTypeIds: PropTypes.array.isRequired,
	urlPrefix: PropTypes.string.isRequired
};

EntityLinks.defaultProps = {
	buttonHref: null,
	excludeTypeIds: false,
	label: ''
};

export default EntityLinks;
