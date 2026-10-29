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
import {withTranslation} from 'react-i18next';


const {Badge, Button, Col, Form, ListGroup, Row} = bootstrap;
const {formatDate, stringToHTMLWithLinks} = utilsHelper;

class RevisionPage extends React.Component {
	static formatValueList(list, isChangeADate) {
		if (!list) {
			return null;
		}
		return list.map(
			(val, idx) => {
				const formattedValue = isChangeADate ? transformISODateForDisplay(val) : val?.toString();
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

	static getEntityDiff(diff, translate) {
		let mergeBadge = null;
		let deleteBadge = null;
		if (diff.isDeletion) {
			if (diff.entityRevision.isMerge) {
				mergeBadge = (
					<Badge
						pill className="merged margin-right-0-5 text-light"
						title={translate('pages.revision.entityMergedTitle', {type: translate(`common.entityType.${_.camelCase(diff.entity.type)}`)})}
					>{translate('pages.revision.badgeMerged')}
					</Badge>);
			}
			else {
				deleteBadge = (
					<Badge
						pill className="deletion margin-right-0-5 text-light"
						title={translate('pages.revision.entityDeletedTitle', {type: translate(`common.entityType.${_.camelCase(diff.entity.type)}`)})}
					>{translate('pages.revision.badgeDeleted')}
					</Badge>);
			}
		}
		return (
			<div key={diff.entity.bbid}>
				<h3>
					{diff.isNew &&
					<Badge
						pill className="new margin-right-0-5 text-light"
						title={translate('pages.revision.entityCreatedTitle', {type: translate(`common.entityType.${_.camelCase(diff.entity.type)}`)})}
					>{translate('pages.revision.badgeNew')}
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

	static formatTitle(author, translate) {
		let title;
		if (_.get(author, ['titleUnlock', 'title'], null)) {
			const authorTitle = author.titleUnlock.title;
			title = `${authorTitle.title}: ${authorTitle.description}`;
		}
		else {
			title = translate('pages.revision.noTitleSet');
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
		const {diffs, revision, t: translate, user} = this.props;
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
				.map(diff => RevisionPage.getEntityDiff(diff, translate));
		}

		const diffDivs = regularDiffs.map(diff => RevisionPage.getEntityDiff(diff, translate));

		const editorTitle =
			RevisionPage.formatTitle(revision.author, translate);

		let revisionNotes = revision.notes.map((note) => {
			const timeCreated = formatDate(new Date(note.postedAt), true);
			const noteAuthorTitle =
				RevisionPage.formatTitle(note.author, translate);
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
			revisionNotes = <p>{translate('pages.revision.noNotes')}</p>;
		}

		const dateRevisionCreated = formatDate(new Date(revision.createdAt), true);
		return (
			<Row id="mergePage">
				<Col lg={12}>
					<h1>{translate('pages.revision.heading', {id: revision.id})}</h1>
					{revision.isMerge && (
						<div className="mergedEntities">
							<h3>
								<span
									className="round-color-icon"
									title={translate('pages.revisions.titleMerge')}
								>
									<FontAwesomeIcon
										flip="vertical" icon={faCodeBranch}
										transform="shrink-4"
									/>
								</span>
								{translate('pages.revision.mergesEntities', {count: mergeDiffDivs.length})}
							</h3>
							{mergeDiffDivs.slice(0, -1)}
							<h4>{translate('pages.revision.mergeInto')}</h4>
							{mergeDiffDivs.slice(-1)}
						</div>
					)}
					{diffDivs}
					<p className="text-right">
						{translate('pages.revision.createdBy')}&nbsp;
						<a
							href={`/editor/${revision.author.id}`}
							title={editorTitle}
						>
							{revision.author.name}
						</a>
						, {dateRevisionCreated}
					</p>

					<h3>{translate('pages.revision.notesHeading')}</h3>
					<ListGroup>
						{revisionNotes}
					</ListGroup>
					{user &&
						<form
							className="margin-top-2"
							onSubmit={this.handleSubmit}
						>
							<Form.Group>
								<Form.Label>{translate('pages.revision.addNote')}</Form.Label>
								<Form.Control
									as="textarea"
									autoComplete="off"
									ref={(ref) => this.noteInput = ref}
									rows="6"
								/>
							</Form.Group>
							<Button
								className="float-right margin-top-1"
								title={translate('pages.revision.submitNoteTitle')}
								type="submit"
								variant="primary"
							>
								{translate('common.button.submit')}
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
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
	user: PropTypes.object
};
RevisionPage.defaultProps = {
	user: null
};

export default withTranslation()(RevisionPage);
