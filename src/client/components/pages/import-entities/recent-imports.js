/*
 * Copyright (C) 2018 Shivam Tripathi
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
import PaginationProps from '../../../helpers/pagination-props';
import PropTypes from 'prop-types';
import React from 'react';
import RecentImportsTable from '../parts/recent-import-results';
import request from 'superagent-bluebird-promise';


const {PageHeader, Pagination} = bootstrap;

class RecentImports extends React.Component {
	constructor(props) {
		super(props);

		this.paginationPropsGenerator = PaginationProps({
			displayedPagesRange: 10,
			itemsPerPage: props.limit
		});

		this.state = {
			currentPage: props.currentPage,
			offset: 0,
			paginationProps: {
				hasBeginningPage: false,
				hasEndPage: false,
				hasNextPage: false,
				hasPreviousPage: false,
				totalPages: 0
			},
			recentImports: []
		};

		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		this.handleClick(this.state.currentPage);
	}

	componentDidUpdate() {
		window.history.replaceState(
			null, null, `?page=${this.state.currentPage}`
		);
	}

	async handleClick(pageNumber) {
		const {currentPage, limit, offset, totalResults, recentImports} =
			await request.get(`/imports/recent/raw?page=${pageNumber}`)
				.then((res) => JSON.parse(res.text));

		const paginationProps = this.paginationPropsGenerator(
			totalResults, currentPage
		);

		this.setState({
			currentPage, limit, offset, paginationProps, recentImports,
			totalResults
		});
	}

	render() {
		const {currentPage, limit, totalResults, paginationProps} = this.state;
		return (
			<div>
				<PageHeader>Recent Imports</PageHeader>
				<h4> The following data has been imported recently. </h4>
				<RecentImportsTable
					offset={this.state.offset}
					recentImports={this.state.recentImports}
				/>
				<p> {`Displaying ${limit} of ${totalResults} results`} </p>
				<Pagination
					boundaryLinks
					ellipsis
					activePage={currentPage}
					className={paginationProps.totalPages === 0 ?
						'hidden' : 'shown'}
					first={paginationProps.hasBeginningPage}
					items={paginationProps.totalPages}
					last={paginationProps.hasEndPage}
					maxButtons={10}
					next={paginationProps.hasNextPage}
					prev={paginationProps.hasPreviousPage}
					onSelect={this.handleClick}
				/>
			</div>
		);
	}
}

RecentImports.displayName = 'RecentImports';
RecentImports.propTypes = {
	currentPage: PropTypes.number,
	limit: PropTypes.number
};
RecentImports.defaultProps = {
	currentPage: 1,
	limit: 10
};

export default RecentImports;

