/*
 * Copyright (C) 2020 Prabal Singh
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


class EditorRevisionPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			results: this.props.results
		};

		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './revisions/revisions';
	}

	searchResultsCallback(newResults) {
		this.setState({results: newResults});
	}

	render() {
		return (
			<div id="pageWithPagination">
				<RevisionsTable
					results={this.state.results}
					showEntities={this.props.showEntities}
					showRevisionEditor={this.props.showRevisionEditor}
					showRevisionNote={this.props.showRevisionNote}
					tableHeading={this.props.tableHeading}
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


EditorRevisionPage.displayName = 'EditorRevisionPage';
EditorRevisionPage.propTypes = {
	from: PropTypes.number,
	nextEnabled: PropTypes.bool.isRequired,
	results: PropTypes.array,
	showEntities: PropTypes.bool,
	showRevisionEditor: PropTypes.bool,
	showRevisionNote: PropTypes.bool,
	size: PropTypes.number,
	tableHeading: PropTypes.string
};
EditorRevisionPage.defaultProps = {
	from: 0,
	results: [],
	showEntities: true,
	showRevisionEditor: false,
	showRevisionNote: true,
	size: 20,
	tableHeading: 'Recent Activity'
};

export default EditorRevisionPage;
