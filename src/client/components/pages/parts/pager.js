/*
 * Copyright (C) 2019 Prabal Singh
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
import * as utils from '../../../../server/helpers/utils';

import PropTypes from 'prop-types';
import React from 'react';
import {isFunction} from 'lodash';
import request from 'superagent';


const {Pager, Button, ButtonGroup, DropdownButton, MenuItem} = bootstrap;

class PagerElement extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			from: this.props.from,
			nextEnabled: this.props.nextEnabled,
			results: this.props.results,
			size: this.props.size
		};
		this.handleClickPrevious = this.handleClickPrevious.bind(this);
		this.handleClickNext = this.handleClickNext.bind(this);
		this.handleResultsPerPageChange = this.handleResultsPerPageChange.bind(this);
		this.triggerSearch = this.triggerSearch.bind(this);
	}

	componentDidMount() {
		window.addEventListener('popstate', this.handleURLChange);

		// Set initial size and from parameter in browser address bar
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('size', this.state.size);
		searchParams.set('from', this.state.from);
		const newSearchParamsString = `?${searchParams.toString()}`;
		if (newSearchParamsString !== window.location.search) {
			window.history.replaceState(null, '', newSearchParamsString);
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.querySearchParams !== this.props.querySearchParams) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({from: 0}, this.triggerSearch);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('popstate', this.handleURLChange);
	}

	handleURLChange = () => {
		const searchParams = new URLSearchParams(window.location.search);
		const {from, size} = this.state;
		let newFrom;
		let newSize;

		if (searchParams.has('from')) {
			newFrom = Number(searchParams.get('from'));
		}
		if (searchParams.has('size')) {
			newSize = Number(searchParams.get('size'));
		}
		if (isFunction(this.props.searchParamsChangeCallback)) {
			this.props.searchParamsChangeCallback(searchParams);
		}
		if (newFrom === from && newSize === size) {
			return;
		}

		this.triggerSearch(newFrom, newSize);
	};

	triggerSearch(newFrom = this.state.from, newSize = this.state.size) {
		const searchParams = new URLSearchParams(this.props.querySearchParams);
		searchParams.set('size', newSize);
		searchParams.set('from', newFrom);
		const newSearchParamsString = `?${searchParams.toString()}`;
		// Don't push a new entry when user navigates with browser prev/next buttons,
		// which already sets the url search params accordingly.
		// Otherwise we rewrite history from this point onwards and prevent from going forward again.
		if (newSearchParamsString !== window.location.search) {
			window.history.pushState(null, '', newSearchParamsString);
		}

		// fetch 1 more result than size to check nextEnabled
		searchParams.set('size', newSize + 1);

		request.get(`${this.props.paginationUrl}?${searchParams.toString()}`)
			.then((res) => JSON.parse(res.text))
			.then((data) => {
				const {newResultsArray, nextEnabled} = utils.getNextEnabledAndResultsArray(data, newSize);
				this.setState({
					from: newFrom,
					nextEnabled,
					results: newResultsArray,
					size: newSize
				});
				this.props.searchResultsCallback(newResultsArray);
			});
	}

	handleClickPrevious() {
		this.triggerSearch(Math.max(this.state.from - this.state.size, 0));
	}

	handleClickNext() {
		this.triggerSearch(this.state.from + this.state.size);
	}

	handleResultsPerPageChange(newSize) {
		this.triggerSearch(this.state.from, parseInt(newSize, 10));
	}

	render() {
		return (
			<div id="PagerElement">
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
		);
	}
}


PagerElement.propTypes = {
	from: PropTypes.number,
	nextEnabled: PropTypes.bool.isRequired,
	paginationUrl: PropTypes.string.isRequired,
	querySearchParams: PropTypes.string,
	results: PropTypes.array,
	searchParamsChangeCallback: PropTypes.func,
	searchResultsCallback: PropTypes.func.isRequired,
	size: PropTypes.number
};
PagerElement.defaultProps = {
	from: 0,
	querySearchParams: '',
	results: [],
	searchParamsChangeCallback: null,
	size: 20
};

export default PagerElement;
