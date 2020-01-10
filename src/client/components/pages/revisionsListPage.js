/*
 * Copyright (C) 2018 Akhilesh Kumar <akhilesh5991@gmail.com>
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
import * as utilsHelper from '../../helpers/utils';

import PropTypes from 'prop-types';
import React from 'react';
import {isNil, startCase as _startCase} from 'lodash';
import {genEntityIconHTMLElement, getEntityLabel} from '../../helpers/entity';
import RevisionsTable from "./parts/revisions-diplayTable";
import request from "superagent-bluebird-promise";


const {PageHeader, Table, Pager, Button, ButtonGroup, DropdownButton, MenuItem} = bootstrap;
const {formatDate} = utilsHelper;

/**
 * Renders the document and displays the topEditors table.
 * @returns {ReactElement} a HTML document which displays the topEditors table
 * in the statistics page
 */


/**
 * Renders the document and displays the EntityCountTable table.
 * @returns {ReactElement} a HTML document which displays the
 * EntityCountTable table in the statistics page
 */


/**
 * Renders the document and displays the 'Statistics' page.
 * @returns {ReactElement} a HTML document which displays the statistics
 * page
 */



class RevisionsListPage extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			from: 0,
			nextEnabled: this.props.results.length === this.props.size,
			results: this.props.results,
			size: this.props.size
		};
		// React does not autobind non-React class methods
		this.triggerSearch = this.triggerSearch.bind(this);
		this.handleClickPrevious = this.handleClickPrevious.bind(this);
		this.handleClickNext = this.handleClickNext.bind(this);
		this.handleResultsPerPageChange = this.handleResultsPerPageChange.bind(this);
	}

	triggerSearch() {
		const pagination = `size=${this.state.size}&from=${this.state.from}`;
		request.get(`./revisions/revisions?${pagination}`)
			.then((res) => JSON.parse(res.text))
			.then((data) => {
				this.setState(prevState => ({
					nextEnabled: data.length >= prevState.size,
					results: data
				}));
			});
	}

	handleClickPrevious(event) {
		this.setState(prevState => ({from: Math.max(prevState.from - prevState.size, 0)}), this.triggerSearch);
	}

	handleClickNext(event) {
		this.setState(prevState => ({from: prevState.from + prevState.size}), this.triggerSearch);
	}

	handleResultsPerPageChange(value) {
		this.setState({size: parseInt(value, 10)}, this.triggerSearch);
	}

	render() {
		return (
			<div className="container">
				<div id="RevisionsPage">

					<RevisionsTable results={this.state.results}/>
					{
						this.state.results && this.state.results.length ?
							<div>
								<hr className="thin"/>
								<Pager>
									<Pager.Item
										previous disabled={this.state.from <= 0}
										href="#" onClick={this.handleClickPrevious}
									>
										&larr; Previous Page
									</Pager.Item>
									<ButtonGroup>
										<Button disabled>Results {this.state.from + 1} —
											{this.state.results.length < this.state.size ?
												this.state.from + this.state.results.length :
												this.state.from + this.state.size
											}
										</Button>
										<DropdownButton
											dropup bsStyle="info" id="bg-nested-dropdown"
											title={`${this.state.size} per page`}
											onSelect={this.handleResultsPerPageChange}
										>
											<MenuItem eventKey="10">10 per page</MenuItem>
											<MenuItem eventKey="20">20 per page</MenuItem>
											<MenuItem eventKey="35">35 per page</MenuItem>
											<MenuItem eventKey="50">50 per page</MenuItem>
											<MenuItem eventKey="100">100 per page</MenuItem>
										</DropdownButton>
									</ButtonGroup>
									<Pager.Item
										next disabled={!this.state.nextEnabled}
										href="#" onClick={this.handleClickNext}
									>
										Next Page &rarr;
									</Pager.Item>
								</Pager>

							</div> :
							null
					}
				</div>
			</div>
		);
	}
}


RevisionsListPage.displayName = 'RevisionsList';
RevisionsListPage.propTypes = {
	entityTypes: PropTypes.array.isRequired,
	from: PropTypes.number,
	results: PropTypes.array,
	size: PropTypes.number
};
RevisionsListPage.defaultProps = {
	from: 0,
	results: [],
	size: 20
};

export default RevisionsListPage;
