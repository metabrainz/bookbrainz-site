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
const React = require('React');
const bootstrap = require('react-bootstrap');

const Row = bootstrap.Row;
const Col = bootstrap.Col;
const ListGroup = bootstrap.ListGroup;
const ListGroupItem = bootstrap.ListGroupItem;

class EntityRevisions extends React.Component {

	constructor(props) {
		super(props);
		this.renderHeader = this.renderHeader.bind(this);
		this.renderRevisions = this.renderRevisions.bind(this);
	}

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

	renderRevisions() {
		const {revisions} = this.props;

		return (
			<ListGroup>
				{revisions.map((revision) => {
					const createdDate = new Date(revision.revision.createdAt);
					const dateLabel = Date.now() - createdDate < 86400000 ?
						createdDate.toLocaleTimeString() :
						createdDate.toLocaleDateString();
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
				})}
			</ListGroup>
		);
	}

	render() {
		return (
			<div>
				{this.renderHeader()}
				<h2>Revision History</h2>
				{this.renderRevisions()}
			</div>
		);
	}
}
EntityRevisions.displayName = 'EntityRevisions';
EntityRevisions.propTypes = {
	entity: React.PropTypes.shape({
		defaultAlias: React.PropTypes.object,
		disambiguation: React.PropTypes.object
	}),
	revisions: React.PropTypes.array
};

module.exports = EntityRevisions;
