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
class SearchResults extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selected: []
		};
		this.toggleRow = this.toggleRow.bind(this);
	}

	toggleRow(entity) {
		// eslint-disable-next-line react/no-access-state-in-setstate
		const oldSelected = this.state.selected;
		let newSelected;
		if (oldSelected.find(selected => selected.bbid === entity.bbid)) {
			newSelected = oldSelected.filter(selected => selected.bbid !== entity.bbid);
		}
		else {
			newSelected = oldSelected.push(entity) && oldSelected;
		}
		this.setState({
			selected: newSelected
		});
	}

	render() {
		const noResults = !this.props.results || this.props.results.length === 0;
		if (noResults) {
			return (
				<div className="text-center">
					<hr className="thin"/>
					<h2 style={{color: '#754e37'}}>
						No results found
					</h2>
					{
						!this.props.condensed &&
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

		const results = this.props.results.map((result) => {
			if (!result) {
				return null;
			}
			const name = result.defaultAlias ? result.defaultAlias.name :
				'(unnamed)';

			const aliases = !this.props.condensed && result.aliasSet &&
				Array.isArray(result.aliasSet.aliases) && result.aliasSet.aliases;

			const secondaryAliases = !this.props.condensed && aliases &&
				_differenceBy(aliases, [result.defaultAlias], 'id').map(alias => alias.name).join(', ');

			const disambiguation = result.disambiguation ? <small>({result.disambiguation.comment})</small> : '';
			// No redirect link for Area entity results
			const link = result.type === 'Area' ?
				`//musicbrainz.org/area/${result.bbid}` :
				`/${_kebabCase(result.type)}/${result.bbid}`;

			/* eslint-disable react/jsx-no-bind */
			return (
				<tr key={result.bbid}>
					<input
						checked={this.state.selected.find(selected => selected.bbid === result.bbid)}
						className="checkbox"
						type="checkbox"
						onChange={() => this.toggleRow(result)}
					/>
					{
						!this.props.condensed &&
						<td>
							{genEntityIconHTMLElement(result.type)}{_startCase(result.type)}
						</td>
					}
					<td>
						<a href={link}>
							{name} {disambiguation}
						</a>
					</td>
					{
						!this.props.condensed &&
						<td>
							{secondaryAliases}
						</td>
					}
				</tr>
			);
		});
		let tableCssClasses = 'table table-striped';
		if (this.props.condensed) {
			tableCssClasses += ' table-condensed';
		}
		return (
			<div>
				{
					!this.props.condensed &&
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
						!this.props.condensed &&
						<thead>
							<tr>
								<th className="col-sm-1">Selcted</th>
								<th className="col-sm-2">Type</th>
								<th className="col-sm-5">Name</th>
								<th className="col-sm-4">Aliases</th>
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
