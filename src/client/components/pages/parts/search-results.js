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

import PropTypes from 'prop-types';
import React from 'react';
import {differenceBy as _differenceBy} from 'lodash';
import {genEntityIconHTMLElement} from '../../../helpers/entity';


const {Button, ButtonGroup, Col, Row, Table} = bootstrap;

class SearchResults extends React.Component {
	constructor() {
		super();
		this.state = {
			isSmallScreen: true
		};
	}

	componentDidMount() {
		this.setScreenWidth();
		window.addEventListener('resize', this.setScreenWidth);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.setScreenWidth);
	}

	setScreenWidth = () => {
		window.innerWidth < 768 ? this.setState({isSmallScreen: true}) : this.setState({isSmallScreen: false});
	};

	render() {
		const noResults = !this.props.results || this.props.results.length === 0;
		if (noResults) {
			return (
				<div className="text-center">
					<hr className="thin"/>
					<h2 style={{color: '#754e37'}}>No results found</h2>
					{!this.props.condensed && (
						<Row>
							<small>Make sure the spelling is correct, and that you have selected the correct type in the search bar.</small>
							<hr className="wide"/>
							<h3>Are we missing an entry?</h3>
							<p>
								Help us and click on the right entity below to create a new entry.
								<br/>
								<small>
									Not sure what to do? Visit the <a href="/help">help page</a> to get started.
								</small>
							</p>
							<Col lg={6} lgOffset={3} md={8} mdOffset={2}>
								<ButtonGroup
									block={this.state.isSmallScreen}
									justified={!this.state.isSmallScreen}
									vertical={this.state.isSmallScreen}
								>
									<Button className="padding-bottom-1 padding-sides-2 padding-top-1" href="/creator/create">
										{genEntityIconHTMLElement('Creator', '3x', false)}
										<div className="margin-top-d4">Author</div>
									</Button>
									<Button className="padding-bottom-1 padding-sides-2 padding-top-1" href="/work/create">
										{genEntityIconHTMLElement('Work', '3x', false)}
										<div className="margin-top-d4">Work</div>
									</Button>
									<Button className="padding-bottom-1 padding-sides-2 padding-top-1" href="/edition/create">
										{genEntityIconHTMLElement('Edition', '3x', false)}
										<div className="margin-top-d4">Edition</div>
									</Button>
									<Button
										className="padding-bottom-1 padding-sides-2 padding-top-1"
										href="/publication/create"
										style={{lineHeight: '1em', whiteSpace: 'normal'}}
									>
										{genEntityIconHTMLElement('Publication', '3x', false)}
										<div className="margin-top-d4">Edition Group</div>
									</Button>
									<Button className="padding-bottom-1 padding-sides-2 padding-top-1" href="/publisher/create">
										{genEntityIconHTMLElement('Publisher', '3x', false)}
										<div className="margin-top-d4">Publisher</div>
									</Button>
								</ButtonGroup>
							</Col>
						</Row>
					)}
				</div>
			);
		}

		const results = this.props.results.map(result => {
			if (!result) {
				return null;
			}
			const name = result.defaultAlias ? result.defaultAlias.name : '(unnamed)';

			const aliases = !this.props.condensed && result.aliasSet && Array.isArray(result.aliasSet.aliases) && result.aliasSet.aliases;

			const secondaryAliases =
				!this.props.condensed &&
				aliases &&
				_differenceBy(aliases, [result.defaultAlias], 'id')
					.map(alias => alias.name)
					.join(', ');

			const disambiguation = result.disambiguation ? <small>({result.disambiguation.comment})</small> : '';
			// No redirect link for Area entity results
			const link = result.type === 'Area' ? `//musicbrainz.org/area/${result.bbid}` : `/${result.type.toLowerCase()}/${result.bbid}`;

			return (
				<tr key={result.bbid}>
					{!this.props.condensed && (
						<td>
							{genEntityIconHTMLElement(result.type)}
							{result.type}
						</td>
					)}
					<td>
						<a href={link} rel="noopener noreferrer" target="_blank">
							{name} {disambiguation}
						</a>
					</td>
					{!this.props.condensed && <td>{secondaryAliases}</td>}
				</tr>
			);
		});
		let tableCssClasses = 'table table-striped';
		if (this.props.condensed) {
			tableCssClasses += ' table-condensed';
		}
		return (
			<div>
				{!this.props.condensed && <h3 style={{color: '#754e37'}}>Search Results</h3>}
				<hr className="thin"/>
				<Table responsive className={tableCssClasses}>
					{!this.props.condensed && (
						<thead>
							<tr>
								<th style={{width: '150px'}}>Type</th>
								<th>Name</th>
								<th>Aliases</th>
							</tr>
						</thead>
					)}
					<tbody>{results}</tbody>
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
