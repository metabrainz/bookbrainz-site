/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Sean Burke
 * 				 2016  Ben Ockmore
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
const FontAwesome = require('react-fontawesome');
const formatDate = require('../../../helpers/utils').formatDate;
const EntityPage = require('../../../containers/entity');
const AttributeList = require('./../parts/attribute-list');
const getLanguageAttribute =
	require('../../../helpers/entity').getLanguageAttribute;
const extractAttribute = require('../../../helpers/entity').extractAttribute;
const extractEntityProps =
	require('../../../../server/helpers/props').extractEntityProps;

function EditionPage(props) {
	const {entity} = props;
	const attributes = (
		<AttributeList
			attributes={EditionPage.getAttributes(entity)}
		/>
	);
	return (
		<EntityPage
			attributes={attributes}
			iconName="book"
			{...extractEntityProps(props)}
		>
			<p>
				{entity.publication ?
					<a href={`/publication/${entity.publication.bbid}`}>
						<FontAwesome name="external-link"/>
						{' See all other editions'}
					</a> :
					<span className="bg-danger">
						Publication unset - please add one if you see this!
					</span>
				}
			</p>
		</EntityPage>
	);
}
EditionPage.getAttributes = (entity) => {
	const editionStatus = extractAttribute(entity.editionStatus, 'label');
	const editionFormat = extractAttribute(entity.editionFormat, 'label');
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
	const dimensions = `${width}×${height}×${depth} mm`;
	return [
		{title: 'Status', data: editionStatus},
		{title: 'Format', data: editionFormat},
		getLanguageAttribute(entity),
		{title: 'Publishers', data: publishers},
		{title: 'Release Date', data: releaseDate},
		{title: 'Page Count', data: pageCount},
		{title: 'Weight', data: weight},
		{title: 'Dimensions', data: dimensions}
	];
};
EditionPage.displayName = 'EditionPage';
EditionPage.propTypes = {
	entity: React.PropTypes.object
};

module.exports = EditionPage;
