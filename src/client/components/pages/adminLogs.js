/*
 * Copyright (C) 2023 Shivam Awasthi
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

import AdminLogsTable from './parts/admin-logs-table';
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import React from 'react';


class AdminLogsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			results: this.props.results
		};

		// React does not autobind non-React class methods
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './admin-logs/admin-logs';
	}

	searchResultsCallback(newResults) {
		this.setState({results: newResults});
	}

	render() {
		return (
			<div id="pageWithPagination">
				<AdminLogsTable
					results={this.state.results}
				/>
				<PagerElement
					from={this.props.from}
					nextEnabled={this.props.nextEnabled}
					paginationUrl={this.paginationUrl}
					results={this.state.results}
					searchResultsCallback={this.searchResultsCallback}
					size={this.props.size}
				/>
			</div>
		);
	}
}


AdminLogsPage.displayName = 'AdminLogsPage';
AdminLogsPage.propTypes = {
	from: PropTypes.number,
	nextEnabled: PropTypes.bool.isRequired,
	results: PropTypes.array,
	size: PropTypes.number
};
AdminLogsPage.defaultProps = {
	from: 0,
	results: [],
	size: 20
};

export default AdminLogsPage;
