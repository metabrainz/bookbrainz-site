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

import * as bootstrap from 'react-bootstrap';
import * as utilsHelper from '../../helpers/utils';
import React from 'react';

const {Col, ListGroup, ListGroupItem, Row} = bootstrap;
const {formatDate, isWithinDayFromNow} = utilsHelper;

/**
* The class is derived from the React Component base class and
* renders the 'Entity Revisions' page.
*/
class EntityRevisions extends React.Component {
	/**
	* Binds the class methods to their respective data.
	* @constructor
	* @param {object} props - Properties passed to the component
	*/
	constructor(props) {
		super(props);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderRevision = this.renderRevision.bind(this);
	}

	/**
	* Renders the Header of the page consisting of Entity name and
	* disambiguation comment.
	* @returns {ReactElement} a HTML document which is a part of Revision page
	*/
	renderHeader() {
		const {entity} = this.props;

		return (
			<Row>
				<Col md={12}>
					<h1>
						{entity.defaultAlias &&
							`${entity.defaultAlias.name} `
						}
						{entity.disambiguation &&
							<small>
								{`(${entity.disambiguation.comment})`}
							</small>
						}
					</h1>
					<hr/>
				</Col>
			</Row>
		);
	}

	/**
	* Renders the data related to Revision such as 'author' and 'date'.
	* It also displays the first revison note which is a summary of the changes
	* made in the revision.
	* @param {object} revision - The revision to be represented by the
	* rendered component.
	* @returns {ReactElement} a HTML document which is a part of the Revision
	* page
	*/
	renderRevision(revision) {
		const createdDate = new Date(revision.revision.createdAt);
		const dateLabel =
			formatDate(createdDate, isWithinDayFromNow(createdDate));
		const header = (
			<h4 className="list-group-item-heading">
				<small className="pull-right">
					{`${revision.revision.author.name}, ${dateLabel}`}
				</small>
				{`r${revision.id}`}
			</h4>
		);

		return (
			<ListGroupItem
				href={`/revision/${revision.id}`}
				key={`${revision.revision.author.id}${revision.id}`}
			>
				{header}
				{revision.revision.notes.length > 0 &&
					<p className="list-group-item-text">
						{revision.revision.notes[0].content}
					</p>
				}
			</ListGroupItem>
		);
	}

	/**
	* Renders the EntityRevisions page, which is a list of all the revisions
	* made to an entity, along with information about the author and the
	* first revision note for each revision.
	* @returns {ReactElement} a HTML document which displays the Revision page
	*/
	render() {
		const {revisions} = this.props;

		return (
			<div>
				{this.renderHeader()}
				<h2>Revision History</h2>
				<ListGroup>
					{revisions.map(this.renderRevision)}
				</ListGroup>
			</div>
		);
	}
}
EntityRevisions.displayName = 'EntityRevisions';
EntityRevisions.propTypes = {
	entity: React.PropTypes.shape({
		defaultAlias: React.PropTypes.object,
		disambiguation: React.PropTypes.object
	}).isRequired,
	revisions: React.PropTypes.array.isRequired
};

export default EntityRevisions;
