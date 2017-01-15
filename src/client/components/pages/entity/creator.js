/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Sean Burke
 * 				 2015  Leo Verto
 * 				 2015  Ben Ockmore
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
const React = require('react');
const EntityPage = require('../../../containers/entity');
const AttributeList = require('./../parts/attribute-list');
const getTypeAttribute = require('../../../helpers/entity').getTypeAttribute;
const getDateAttributes = require('../../../helpers/entity').getDateAttributes;
const extractAttribute = require('../../../helpers/entity').extractAttribute;
const extractEntityProps =
	require('../../../../server/helpers/props').extractEntityProps;

function CreatorPage(props) {
	const {entity} = props;
	const attributes = (
		<AttributeList
			attributes={CreatorPage.getAttributes(entity)}
		/>
	);
	return (
		<EntityPage
			attributes={attributes}
			iconName="user"
			{...extractEntityProps(props)}
		/>
	);
}
CreatorPage.displayName = 'CreatorPage';
CreatorPage.propTypes = {
	entity: React.PropTypes.object
};
CreatorPage.getAttributes = (entity) => ([
	getTypeAttribute(entity.creatorType),
	{title: 'Gender', data: extractAttribute(entity.gender, 'name')},
	{
		title: 'Begin Area',
		data: extractAttribute(entity.beginArea, 'name')
	},
	{title: 'End Area', data: extractAttribute(entity.endArea, 'name')},
	getDateAttributes(entity)
]);

module.exports = CreatorPage;
