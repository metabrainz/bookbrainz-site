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

import CollectionsTable from './parts/collections-table';
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import React from 'react';


class CollectionsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			querySearchParams: '',
			results: this.props.results
		};

		this.handleTypeChange = this.handleTypeChange.bind(this);
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './collections/collections';
	}

	searchResultsCallback(newResults) {
		this.setState({results: newResults});
	}

	handleTypeChange(type) {
		const querySearchParams = type ? `type=${type}` : '';
		this.setState({querySearchParams});
	}

	render() {
		return (
			<div id="pageWithPagination">
				<CollectionsTable
					entityTypes={this.props.entityTypes}
					results={this.state.results}
					showIfOwnerOrCollaborator={this.props.showIfOwnerOrCollaborator}
					showLastModified={this.props.showLastModified}
					showOwner={this.props.showOwner}
					showPrivacy={this.props.showPrivacy}
					tableHeading={this.props.tableHeading}
					onTypeChange={this.handleTypeChange}
				/>
				<PagerElement
					from={this.props.from}
					nextEnabled={this.props.nextEnabled}
					paginationUrl={this.paginationUrl}
					querySearchParams={this.state.querySearchParams}
					results={this.state.results}
					searchResultsCallback={this.searchResultsCallback}
					size={this.props.size}
				/>
			</div>
		);
	}
}


CollectionsPage.displayName = 'CollectionsPage';
CollectionsPage.propTypes = {
	entityTypes: PropTypes.array.isRequired,
	from: PropTypes.number,
	nextEnabled: PropTypes.bool.isRequired,
	results: PropTypes.array,
	showIfOwnerOrCollaborator: PropTypes.bool,
	showLastModified: PropTypes.bool,
	showOwner: PropTypes.bool,
	showPrivacy: PropTypes.bool,
	size: PropTypes.number,
	tableHeading: PropTypes.string
};
CollectionsPage.defaultProps = {
	from: 0,
	results: [],
	showIfOwnerOrCollaborator: false,
	showLastModified: false,
	showOwner: false,
	showPrivacy: false,
	size: 20,
	tableHeading: 'Collections'
};

export default CollectionsPage;
