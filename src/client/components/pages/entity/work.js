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
/* eslint strict: 0 */

import * as entityHelper from '../../../helpers/entity';
import * as propsHelper from '../../../../server/helpers/props';
import AttributeList from '../parts/attribute-list';
import EntityPage from '../../../containers/entity';
import React from 'react';


const {getLanguageAttribute, getTypeAttribute} = entityHelper;
const {extractEntityProps} = propsHelper;

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
	entity: React.PropTypes.object.isRequired
};

export default WorkPage;
