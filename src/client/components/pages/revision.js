/*
 * Copyright (C) 2015-2016  Stanisław Szcześniak
 *               2015-2016  Ben Ockmore
 *               2016       Sean Burke
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

const EntityLink = require('../entity-link');

(() => {
	'use strict';

	class RevisionPage extends React.Component {
		static formatValueList(list) {
			if (!list) {
				return null;
			}

			return list.map((val, idx) => (
				<div key={idx}>{val.toString()}</div>
			));
		}

		static formatChange(change) {
			if (change.kind === 'N') {
				return (
					<tr className="success"
						key={change.key}
					>
						<th scope="row">{change.key}</th>
						<td> — </td>
						<td>
							{RevisionPage.formatValueList(change.rhs)}
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
							{RevisionPage.formatValueList(change.lhs)}
						</td>
						<td>
							{RevisionPage.formatValueList(change.rhs)}
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
							{RevisionPage.formatValueList(change.lhs)}
						</td>
						<td> — </td>
					</tr>
				);
			}

			return null;
		}

		static formatDiff(diff) {
			const result = diff.changes.map(
				(change) =>
					RevisionPage.formatChange(change)
			);

			return _compact(result);
		}

		static formatTitle(author) {
			let title;
			if (author.titleUnlock.title) {
				const authorTitle = author.titleUnlock.title;
				title = `${authorTitle.title}: ${authorTitle.description}`;
			}
			else {
				title = 'No Title Set: This user hasn\'t selected a title';
			}
			return title;
		}

		render() {
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
						{RevisionPage.formatDiff(diff)}
						</tbody>
					</table>
				</div>
			));

			const editorTitle =
				RevisionPage.formatTitle(revision.author);

			let revisionNotes = revision.notes.map((note) => {
				const timeCreated =
					new Date(note.postedAt).toTimeString();
				const dateCreated =
					new Date(note.postedAt).toDateString();
				const noteAuthorTitle =
					RevisionPage.formatTitle(note.author);
				return (
					<div
						className="panel panel-default"
						key={note.id}
					>
						<div className="panel-body">
							<p>{note.content}</p>
							<p className="text-right">
								—&nbsp;
								<a
									href={`/editor/${note.author.id}`}
									title={noteAuthorTitle}
								>
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
						<a
							href={`/editor/${revision.author.id}`}
							title={editorTitle}
						>
							{revision.author.name}
						</a>
						, {dateRevisionCreated}
					</p>

					<h3>Revision Notes</h3>
					{revisionNotes}

				</div>
			);
		}
	}

	RevisionPage.displayName = 'RevisionPage';
	RevisionPage.propTypes = {
		diffs: React.PropTypes.any.isRequired,
		revision: React.PropTypes.any.isRequired
	};

	module.exports = RevisionPage;
})();
