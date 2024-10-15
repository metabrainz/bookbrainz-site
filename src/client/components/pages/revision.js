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

import * as bootstrap from 'react-bootstrap';
import * as utilsHelper from '../../helpers/utils';

import EntityLink from '../entity-link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {faCodeBranch} from '@fortawesome/free-solid-svg-icons';
import request from 'superagent';
import {transformISODateForDisplay} from '../../helpers/entity';


const {Badge, Button, Col, Form, ListGroup, Row} = bootstrap;
const {formatDate, stringToHTMLWithLinks} = utilsHelper;

class RevisionPage extends React.Component {
	static formatValueList(list, isChangeADate) {
		if (!list) {
			return null;
		}
		return list.map(
			(val, idx) => {
				const formattedValue = isChangeADate ? transformISODateForDisplay(val) : val.toString();
				// eslint-disable-next-line react/no-array-index-key
				return <div key={`${idx}${val}`}>{formattedValue}</div>;
			}
		);
	}

	static formatChange(change) {
		const isChangeADate = change.key.toLowerCase().match(/\bdate\b/);
		if (change.kind === 'N') {
			return (
				<tr className="table-success" key={change.key}>
					<th scope="row">{change.key}</th>
					<td> — </td>
					<td>
						{RevisionPage.formatValueList(change.rhs, isChangeADate)}
					</td>
				</tr>
			);
		}

		if (change.kind === 'E') {
			return (
				<tr className="table-warning" key={change.key}>
					<th scope="row">{change.key}</th>
					<td>
						{RevisionPage.formatValueList(change.lhs, isChangeADate)}
					</td>
					<td>
						{RevisionPage.formatValueList(change.rhs, isChangeADate)}
					</td>
				</tr>
			);
		}

		if (change.kind === 'D') {
			return (
				<tr className="table-danger" key={change.key}>
					<th scope="row">{change.key}</th>
					<td>
						{RevisionPage.formatValueList(change.lhs, isChangeADate)}
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

		return _.compact(result);
	}

	static getEntityDiff(diff) {
		let mergeBadge = null;
		let deleteBadge = null;
		if (diff.isDeletion) {
			if (diff.entityRevision.isMerge) {
				mergeBadge = (
					<Badge
						pill className="merged margin-right-0-5 text-light"
						title={`This ${diff.entity.type} was merged in this revision`}
					>Merged
					</Badge>);
			}
			else {
				deleteBadge = (
					<Badge
						pill className="deletion margin-right-0-5 text-light"
						title={`This ${diff.entity.type} was deleted in this revision`}
					>- Deleted
					</Badge>);
			}
		}
		return (
			<div key={diff.entity.bbid}>
				<h3>
					{diff.isNew &&
					<Badge
						pill className="new margin-right-0-5 text-light"
						title={`This ${diff.entity.type} was created in this revision`}
					>+ New
					</Badge>}
					{mergeBadge}
					{deleteBadge}
					<EntityLink
						entity={diff.entity}
					/>
				</h3>
				{diff.changes.length ? (
					<table className="table table-bordered text-center">
						<tbody>
							{RevisionPage.formatDiff(diff)}
						</tbody>
					</table>) : null}
			</div>
		);
	}

	static formatTitle(author) {
		let title;
		if (_.get(author, ['titleUnlock', 'title'], null)) {
			const authorTitle = author.titleUnlock.title;
			title = `${authorTitle.title}: ${authorTitle.description}`;
		}
		else {
			title = 'No Title Set: This user hasn\'t selected a title';
		}
		return title;
	}

	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();
		const data = {
			note: this.noteInput.value
		};
		request.post(`/revision/${this.props.revision.id}/note`)
			.send(data)
			.then(() => {
				location.reload();
			})
			.catch((res) => {
				// TODO: Add proper error handling.
				const {error} = res.body;
				return error;
			});
	}

	render() {
		const {revision, diffs, user} = this.props;
		let regularDiffs = diffs;
		let mergeDiffDivs;

		if (revision.isMerge) {
			/**
			 * Separate entities between merged and not merged
			 */
			const mergeDiffs = _.filter(diffs, diff => diff.entityRevision.isMerge);
			regularDiffs = _.filter(diffs, diff => !diff.entityRevision.isMerge);

			/**
			 * We sort the merged entities diffs by number of changes.
			 * Display the entity we merge into at the bottom ('merges entity X and Y into Z')
			 */
			mergeDiffDivs = mergeDiffs
				.sort((a, b) => {
					if (!a.entityRevision.dataId) {
						return -1;
					}
					if (!b.entityRevision.dataId) {
						return 1;
					}
					return 0;
				})
				.map(RevisionPage.getEntityDiff);
		}

		const diffDivs = regularDiffs.map(RevisionPage.getEntityDiff);

		const editorTitle =
			RevisionPage.formatTitle(revision.author);

		let revisionNotes = revision.notes.map((note) => {
			const timeCreated = formatDate(new Date(note.postedAt), true);
			const noteAuthorTitle =
				RevisionPage.formatTitle(note.author);
			return (
				<ListGroup.Item
					key={note.id}
				>
					<div className="revision-note">
						<p className="note-content">
							{stringToHTMLWithLinks(note.content)}
						</p>
						<p className="text-right">
							—&nbsp;
							<a
								href={`/editor/${note.author.id}`}
								title={noteAuthorTitle}
							>
								{note.author.name}
							</a>
							, {`${timeCreated}`}
						</p>
					</div>
				</ListGroup.Item>
			);
		});

		if (revisionNotes.length === 0) {
			revisionNotes = <p> No revision notes present </p>;
		}

		const dateRevisionCreated = formatDate(new Date(revision.createdAt), true);
		return (
			<Row id="mergePage">
				<Col lg={12}>
					<h1>Revision #{revision.id}</h1>
					{revision.isMerge && (
						<div className="mergedEntities">
							<h3>
								<span
									className="round-color-icon"
									title="Merge revision"
								>
									<FontAwesomeIcon
										flip="vertical" icon={faCodeBranch}
										transform="shrink-4"
									/>
								</span>
								Merges {mergeDiffDivs.length > 2 ? 'entities' : 'entity'}:
							</h3>
							{mergeDiffDivs.slice(0, -1)}
							<h4>Into:</h4>
							{mergeDiffDivs.slice(-1)}
						</div>
					)}
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
					<ListGroup>
						{revisionNotes}
					</ListGroup>
					{user &&
						<form
							className="margin-top-2"
							onSubmit={this.handleSubmit}
						>
							<Form.Group>
								<Form.Label>Add Note</Form.Label>
								<Form.Control
									as="textarea"
									autoComplete="off"
									ref={(ref) => this.noteInput = ref}
									rows="6"
								/>
							</Form.Group>
							<Button
								className="float-end margin-top-1"
								title="Submit revision note"
								type="submit"
								variant="primary"
							>
								Submit
							</Button>
						</form>
					}
				</Col>
			</Row>
		);
	}
}

RevisionPage.displayName = 'RevisionPage';
RevisionPage.propTypes = {
	diffs: PropTypes.any.isRequired,
	revision: PropTypes.any.isRequired,
	user: PropTypes.object
};
RevisionPage.defaultProps = {
	user: null
};

export default RevisionPage;
