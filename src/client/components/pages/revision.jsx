/*
 * Copyright (C) 2015-2016  Stanisław Szcześniak
 *                          Ben Ockmore
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
const _compact = require('lodash.compact');
const EntityLink = require('../entityLink.jsx');

function formatValueList(list) {
	'use strict';

	if (!list) {
		return null;
	}

	return list.map((val, idx) => (
		<div key={idx}>{val.toString()}</div>
	));
}

module.exports = React.createClass({
	displayName: 'RevisionPage',
	propTypes: {
		diffs: React.PropTypes.any.isRequired,
		revision: React.PropTypes.any.isRequired
	},
	formatChange(change) {
		'use strict';
		if (change.kind === 'N') {
			return (
				<tr className="success"
					key={change.key}
				>
					<th scope="row">{change.key}</th>
					<td> — </td>
					<td>
						{formatValueList(change.rhs)}
					</td>
				</tr>
			);
		}

		if (change.kind === 'E') {
			return (
				<tr
					className="warning"
					key={change.key}
				>
					<th scope="row">{change.key}</th>
					<td>
						{formatValueList(change.lhs)}
					</td>
					<td>
						{formatValueList(change.rhs)}
					</td>
				</tr>
			);
		}

		if (change.kind === 'D') {
			return (
				<tr
					className="danger"
					key={change.key}
				>
					<th scope="row">{change.key}</th>
					<td>
						{formatValueList(change.lhs)}
					</td>
					<td> — </td>
				</tr>
			);
		}

		return null;
	},
	formatDiff(diff) {
		'use strict';
		const result = diff.changes.map((change) => this.formatChange(change));
		return _compact(result);
	},
	render() {
		'use strict';
		const revision = this.props.revision;
		const diffs = this.props.diffs;

		const diffDivs = diffs.map((diff) => (
			<div key="{diff.entity.bbid}">
				<h3>
					<EntityLink
						bbid={diff.entity.bbid}
						text={`${diff.entity.type} ${diff.entity.bbid}`}
						type={diff.entity.type}
					/>
				</h3>
				<table className="table table-bordered text-center">
					<tbody>
						{this.formatDiff(diff)}
					</tbody>
				</table>
			</div>
		));

		let revisionNotes = revision.notes.map((note) => {
			const timeCreated =
				new Date(note.postedAt).toTimeString();
			const dateCreated =
				new Date(note.postedAt).toDateString();

			return (
				<div
					className="panel panel-default"
					key={note.id}
				>
					<div className="panel-body">
						<p>{note.content}</p>
						<p className="text-right">
							—&nbsp;
							<a href={`/editor/${note.author.id}`}>
								{note.author.name}
							</a>
							, {`${timeCreated}, ${dateCreated}`}
						</p>
					</div>
				</div>
			);
		});

		if (revisionNotes.length === 0) {
			revisionNotes = (<p> No revision notes present </p>);
		}

		const dateRevisionCreated =
			new Date(revision.createdAt).toDateString();

		return (
			<div>
				<h1>Revision #{revision.id}</h1>
				{diffDivs}
				<p className="text-right">
					Created by&nbsp;
					<a href={`/editor/${revision.author.id}`}>
						{revision.author.name}
					</a>
					, {dateRevisionCreated}
				</p>

				<h3>Revision Notes</h3>
				{revisionNotes}

			</div>
		);
	}
});
