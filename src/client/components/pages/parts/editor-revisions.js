/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Max Prettyjohns
 * 				 2015  Sean Burke
 * 				 2015  Ben Ockmore
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
const React = require('react');

const bootstrap = require('react-bootstrap');
const formatDate = require('../../../helpers/utils').formatDate;
const isWithinDay = require('../../../helpers/utils').isWithinDay;

const ListGroup = bootstrap.ListGroup;
const ListGroupItem = bootstrap.ListGroupItem;

class EditorRevisionsTab extends React.Component {

	render() {
		const {editor} = this.props;
		const revisions = editor.revisions;

		return (
			<div>
				<h2>Revision History</h2>
				<ListGroup>
					{revisions.map((revision) => {
						const createdDate = new Date(revision.createdAt);
						const dateLabel =
							formatDate(createdDate, isWithinDay(createdDate));
						const header = (
							<h4 className="list-group-item-heading">
								<small className="pull-right">
									{`${editor.name} - ${dateLabel}`}
								</small>
								{`r${revision.id}`}
							</h4>
						);
						return (
						<ListGroupItem
							href={`/revision/${revision.id}`}
							key={`${editor.id}${revision.id}`}
						>
							{header}
							{revision.note}
						</ListGroupItem>
						);
					})}
				</ListGroup>
			</div>
		);
	}
}

EditorRevisionsTab.displayName = 'EditorRevisionsTab';
EditorRevisionsTab.propTypes = {
	editor: React.PropTypes.shape({
		revisions: React.PropTypes.array,
		name: React.PropTypes.string,
		id: React.PropTypes.number
	})
};

module.exports = EditorRevisionsTab;
