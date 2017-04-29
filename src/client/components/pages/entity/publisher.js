/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
 * 				 2016  Sean Burke
 * 				 2016  Ohm Patel
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

const {
	extractAttribute, getTypeAttribute, getDateAttributes, showEntityEditions
} = entityHelper;
const {extractEntityProps} = propsHelper;

function PublisherPage(props) {
	const {entity} = props;
	const attributes = (
		<AttributeList
			attributes={PublisherPage.getAttributes(entity)}
		/>
	);
	return (
		<EntityPage
			attributes={attributes}
			iconName="university"
			{...extractEntityProps(props)}
		>
			{showEntityEditions(entity)}
		</EntityPage>
	);
}
PublisherPage.getAttributes = (entity) => ([
	getTypeAttribute(entity.publisherType),
	{data: extractAttribute(entity.area, 'name'), title: 'Area'},
	getDateAttributes(entity)
]);
PublisherPage.displayName = 'PublisherPage';
PublisherPage.propTypes = {
	entity: React.PropTypes.object.isRequired
};

export default PublisherPage;
