/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Ben Ockmore
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

import {genEntityIconHTMLElement, getEntityLabel, getEntityUrl} from '../../helpers/entity';
import PagerElement from './parts/pager';
import PropTypes from 'prop-types';
import React from 'react';
import RevisionsTable from './parts/revisions-table';


/**
 * The class is derived from the React Component base class and
 * renders the 'Entity RevisionsPage' page.
 */
class EntityRevisions extends React.Component {
	/**
	 * Binds the class methods to their respective data.
	 * @constructor
	 * @param {object} props - Properties passed to the component
	 */
	constructor(props) {
		super(props);
		this.state = {
			results: this.props.revisions
		};

		// React does not autobind non-React class methods
		this.renderHeader = this.renderHeader.bind(this);
		this.searchResultsCallback = this.searchResultsCallback.bind(this);
		this.paginationUrl = './revisions/revisions';
	}

	searchResultsCallback(newResults) {
		this.setState({results: newResults});
	}

	/**
	 * Renders the Header of the page consisting of Entity name and
	 * disambiguation comment.
	 * @returns {ReactElement} a HTML document which is a part of Revision page
	 */
	renderHeader() {
		const {entity} = this.props;
		return (
			<div>
				Revision History
				<h3>
					for&nbsp;
					<a href={getEntityUrl(entity)} >
						{genEntityIconHTMLElement(entity.type)}
						{getEntityLabel(entity)}
					</a>
				</h3>
			</div>
		);
	}


	/**
	 * Renders the EntityRevisions page, which is a list of all the revisions
	 * made to an entity, along with information about the author and the
	 * first revision note for each revision.
	 * @returns {ReactElement} a HTML document which displays the Revision page
	 */
	render() {
		return (
			<div id="pageWithPagination">
				<RevisionsTable
					results={this.state.results}
					showEntities={this.props.showEntities}
					showRevisionEditor={this.props.showRevisionEditor}
					showRevisionNote={this.props.showRevisionNote}
					tableHeading={this.renderHeader()}
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
EntityRevisions.displayName = 'EntityRevisions';
EntityRevisions.propTypes = {
	entity: PropTypes.shape({
		defaultAlias: PropTypes.object,
		disambiguation: PropTypes.object,
		type: PropTypes.string
	}).isRequired,
	from: PropTypes.number,
	nextEnabled: PropTypes.bool.isRequired,
	revisions: PropTypes.array.isRequired,
	showEntities: PropTypes.bool,
	showRevisionEditor: PropTypes.bool,
	showRevisionNote: PropTypes.bool,
	size: PropTypes.number
};
EntityRevisions.defaultProps = {
	from: 0,
	showEntities: false,
	showRevisionEditor: false,
	showRevisionNote: false,
	size: 20
};

export default EntityRevisions;
