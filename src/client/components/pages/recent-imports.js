import * as bootstrap from 'react-bootstrap';
import PaginationProps from '../../helpers/pagination-props';
import PropTypes from 'prop-types';
import React from 'react';
import RecentImportsTable from './parts/recent-import-results';
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
		this.handleCb = this.handleCb.bind(this);
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

	handleCb() {
		this.handleClick(this.state.currentPage + 1);
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

