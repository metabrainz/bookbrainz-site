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
const React = require('react');
const showEntityType = require('../../../helpers/entity').showEntityType;
const showBeginEndDate = require('../../../helpers/entity').showBeginEndDate;
const showEntityEditions =
	require('../../../helpers/entity').showEntityEditions;
const extractAttribute = require('../../../helpers/entity').extractAttribute;

class PublisherPage extends React.Component {

	static get iconName() {
		return 'university';
	}

	static attributes(entity) {
		return (
			<div>
				{showEntityType(entity.publisherType)}
				<dt>Area</dt>
				<dd>{extractAttribute(entity.area, 'name')}</dd>
				{showBeginEndDate(entity)}
			</div>
		);
	}

	render() {
		const {entity} = this.props;
		return showEntityEditions(entity);
	}
}
PublisherPage.displayName = 'PublisherPage';
PublisherPage.propTypes = {
	entity: React.PropTypes.object
};

module.exports = PublisherPage;
