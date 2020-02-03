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

import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import React from 'react';
import RevisionsTable from './parts/revisions-table';


class RevisionsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			from: this.props.from,
			results: this.props.results,
			size: this.props.size
		};

		// React does not autobind non-React class methods
		this.changeDataInTable = this.changeDataInTable.bind(this);
		this.paginationUrl = './revisions/revisions?q=';
	}

	changeDataInTable(newResults) {
		this.setState({results: newResults});
	}

	render() {
		return (
			<div className="container">
				<div id="RevisionsPage">

					<RevisionsTable results={this.state.results}/>
					<PagerElement
						changeDataInTable={this.changeDataInTable}
						from={this.state.from}
						paginationUrl={this.paginationUrl}
						results={this.state.results}
						size={this.state.size}
					/>
				</div>
			</div>
		);
	}
}


RevisionsPage.displayName = 'RevisionsPage';
RevisionsPage.propTypes = {
	from: PropTypes.number,
	results: PropTypes.array,
	size: PropTypes.number
};
RevisionsPage.defaultProps = {
	from: 0,
	results: [],
	size: 20
};

export default RevisionsPage;
