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

import EditorCollectionsTable from './parts/editor-collections-table';
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import React from 'react';


class EditorCollectionsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			results: this.props.results
		};

		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './collections/collections?q=';
	}

	searchResultsCallback(newResults) {
		this.setState({results: newResults});
	}

	handleTypeChange(type) {
		if (typeof type !== 'string') {
			return;
		}

		const query = type ? `&type=${type}` : '';

		this.setState({from: 0, query});
	}

	render() {
		return (
			<div id="pageWithPagination">
				<EditorCollectionsTable
					results={this.state.results}
					tableHeading={this.props.tableHeading}
					onTypeChange={this.handleTypeChange}
				/>
				<PagerElement
					from={this.props.from}
					nextEnabled={this.props.nextEnabled}
					paginationUrl={this.paginationUrl}
					query={this.state.query}
					results={this.state.results}
					searchResultsCallback={this.searchResultsCallback}
					size={this.props.size}
				/>
			</div>
		);
	}
}


EditorCollectionsPage.displayName = 'EditorCollectionsPage';
EditorCollectionsPage.propTypes = {
	from: PropTypes.number,
	nextEnabled: PropTypes.bool.isRequired,
	results: PropTypes.array,
	size: PropTypes.number,
	tableHeading: PropTypes.string,
	// eslint-disable-next-line react/no-unused-prop-types
	type: PropTypes.string
};
EditorCollectionsPage.defaultProps = {
	from: 0,
	results: [],
	size: 20,
	tableHeading: 'Collections',
	type: null
};

export default EditorCollectionsPage;
