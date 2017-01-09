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
const React = require('react');
const FontAwesome = require('react-fontawesome');
const formatDate = require('../../../helpers/utils').formatDate;
const extractAttribute = require('../../../helpers/utils').extractAttribute;

class EditionPage extends React.Component {

	static get iconName() {
		return 'book';
	}

	static attributes(entity) {
		const editionStatus = extractAttribute(entity.editionStatus, 'label');
		const editionFormat = extractAttribute(entity.editionFormat, 'label');
		const languages = (entity.languageSet && entity.languageSet.languages) ?
			entity.languageSet.languages.map(
				(language) => language.name
			).join(', ') : '?';
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
			formatDate(new Date(entity.releaseEventSet.releaseEvents[0].date)) :
			'?';
		const pageCount = extractAttribute(entity.pages);
		const weight = extractAttribute(entity.weight);
		const width = extractAttribute(entity.width);
		const height = extractAttribute(entity.height);
		const depth = extractAttribute(entity.depth);

		return (
			<div>
				<dt>Status</dt>
				<dd>{editionStatus}</dd>
				<dt>Format</dt>
				<dd>{editionFormat}</dd>
				<dt>Languages</dt>
				<dd>{languages}</dd>
				<dt>Publishers</dt>
				<dd>{publishers}</dd>
				<dt>Release Date</dt>
				<dd>{releaseDate}</dd>
				<dt>Page Count</dt>
				<dd>{pageCount}</dd>
				<dt>Weight</dt>
				<dd>{weight}</dd>
				<dt>Dimensions (W×H×D)</dt>
				<dd>{`${width}×${height}×${depth} mm`}</dd>
			</div>
		);
	}

	render() {
		const {entity} = this.props;
		return (
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
		);
	}
}
EditionPage.displayName = 'EditionPage';
EditionPage.propTypes = {
	entity: React.PropTypes.object
};

module.exports = EditionPage;
