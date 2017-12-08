/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Sean Burke
 * 				 2016  Ben Ockmore
 * 				 2015  Leo Verto
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

import * as entityHelper from '../../../helpers/entity';
import AttributeList from '../parts/attribute-list';
import EntityPage from '../../../containers/entity';
import PropTypes from 'prop-types';
import React from 'react';
import {extractEntityProps} from '../../../helpers/props';


const {getLanguageAttribute, getTypeAttribute} = entityHelper;

function WorkPage(props) {
	const {entity} = props;
	const attributes = (
		<AttributeList
			attributes={WorkPage.getAttributes(entity)}
		/>
	);
	return (
		<EntityPage
			attributes={attributes}
			iconName="file-text-o"
			{...extractEntityProps(props)}
		/>
	);
}
WorkPage.getAttributes = (entity) => [
	getTypeAttribute(entity.workType),
	getLanguageAttribute(entity)
];
WorkPage.displayName = 'WorkPage';
WorkPage.propTypes = {
	entity: PropTypes.object.isRequired
};

export default WorkPage;
