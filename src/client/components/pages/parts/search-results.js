/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
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

import {differenceBy as _differenceBy, kebabCase as _kebabCase, startCase as _startCase} from 'lodash';

import CallToAction from './call-to-action';
import PropTypes from 'prop-types';
import React from 'react';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


const {Row, Table} = bootstrap;

/**
 * Renders the document and displays the 'SearchResults' page.
 * @returns {ReactElement} a HTML document which displays the SearchResults.
 * @param {object} props - Properties passed to the component.
 */

function SearchResults(props) {
	const noResults = !props.results || props.results.length === 0;
	if (noResults) {
		return (
			<div className="text-center">
				<hr className="thin"/>
				<h2 style={{color: '#754e37'}}>
					No results found
				</h2>
				{
					!props.condensed &&
					<Row>
						<small>Make sure the spelling is correct, and that you have selected the correct type in the search bar.</small>
						<hr className="wide"/>
						<h3>Are we missing an entry?</h3>
						<CallToAction/>
					</Row>
				}
			</div>
		);
	}

	const results = props.results.map((result) => {
		if (!result) {
			return null;
		}
		const name = result.defaultAlias ? result.defaultAlias.name :
			'(unnamed)';

		const aliases = !props.condensed && result.aliasSet &&
		Array.isArray(result.aliasSet.aliases) && result.aliasSet.aliases;

		const secondaryAliases = !props.condensed && aliases &&
			_differenceBy(aliases, [result.defaultAlias], 'id').map(alias => alias.name).join(', ');

		const disambiguation = result.disambiguation ? <small>({result.disambiguation.comment})</small> : '';
		// No redirect link for Area entity results
		const link = result.type === 'Area' ?
			`//musicbrainz.org/area/${result.bbid}` :
			`/${_kebabCase(result.type)}/${result.bbid}`;

		return (
			<tr key={result.bbid}>
				{
					!props.condensed &&
					<td>
						{genEntityIconHTMLElement(result.type)}{_startCase(result.type)}
					</td>
				}
				<td>
					<a href={link} rel="noopener noreferrer" target="_blank">
						{name} {disambiguation}
					</a>
				</td>
				{
					!props.condensed &&
					<td>
						{secondaryAliases}
					</td>
				}
			</tr>
		);
	});
	let tableCssClasses = 'table table-striped';
	if (props.condensed) {
		tableCssClasses += ' table-condensed';
	}
	return (
		<div>
			{
				!props.condensed &&
				<h3 style={{color: '#754e37'}}>
					Search Results
				</h3>
			}
			<hr className="thin"/>
			<Table
				responsive
				className={tableCssClasses}
			>
				{
					!props.condensed &&
					<thead>
						<tr>
							<th style={{width: '150px'}}>Type</th>
							<th>Name</th>
							<th>Aliases</th>
						</tr>
					</thead>
				}
				<tbody>
					{results}
				</tbody>
			</Table>
		</div>
	);
}

SearchResults.displayName = 'SearchResults';
SearchResults.propTypes = {
	condensed: PropTypes.bool,
	results: PropTypes.array
};
SearchResults.defaultProps = {
	condensed: false,
	results: null
};

export default SearchResults;
