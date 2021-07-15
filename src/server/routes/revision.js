/*
 * Copyright (C) 2015-2016  Ben Ockmore
 *               2016       Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as baseFormatter from '../helpers/diffFormatters/base';
import * as entityFormatter from '../helpers/diffFormatters/entity';
import * as entityRoutes from './entity/entity';
import * as error from '../../common/helpers/error';
import * as languageSetFormatter from '../helpers/diffFormatters/languageSet';
import * as propHelpers from '../../client/helpers/props';
import * as publisherSetFormatter from '../helpers/diffFormatters/publisherSet';
import * as releaseEventSetFormatter from
	'../helpers/diffFormatters/releaseEventSet';

import {escapeProps, generateProps} from '../helpers/props';

import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RevisionPage from '../../client/components/pages/revision';
import _ from 'lodash';
import express from 'express';
import log from 'log';
import {makePromiseFromObject} from '../../common/helpers/utils';
import target from '../templates/target';


const router = express.Router();

function formatAuthorChange(change) {
	if (_.isEqual(change.path, ['beginDate'])) {
		return baseFormatter.formatScalarChange(change, 'Begin Date');
	}

	if (_.isEqual(change.path, ['endDate'])) {
		return baseFormatter.formatScalarChange(change, 'End Date');
	}

	if (_.isEqual(change.path, ['gender'])) {
		return baseFormatter.formatGenderChange(change);
	}

	if (_.isEqual(change.path, ['ended'])) {
		return baseFormatter.formatEndedChange(change);
	}
	if (_.isEqual(change.path, ['authorType']) ||
			_.isEqual(change.path, ['authorType', 'label'])) {
		return baseFormatter.formatTypeChange(change, 'Author Type');
	}

	if (_.isEqual(change.path, ['beginArea']) ||
			_.isEqual(change.path, ['beginArea', 'name'])) {
		return baseFormatter.formatAreaChange(change, 'Begin Area');
	}

	if (_.isEqual(change.path, ['endArea']) ||
			_.isEqual(change.path, ['endArea', 'name'])) {
		return baseFormatter.formatAreaChange(change, 'End Area');
	}

	return null;
}

function formatEditionChange(change) {
	if (_.isEqual(change.path, ['editionGroupBbid'])) {
		return baseFormatter.formatScalarChange(change, 'EditionGroup');
	}

	if (publisherSetFormatter.changed(change)) {
		return publisherSetFormatter.format(change);
	}

	if (releaseEventSetFormatter.changed(change)) {
		return releaseEventSetFormatter.format(change);
	}

	if (languageSetFormatter.changed(change)) {
		return languageSetFormatter.format(change);
	}

	if (_.isEqual(change.path, ['width']) ||
			_.isEqual(change.path, ['height']) ||
			_.isEqual(change.path, ['depth']) ||
			_.isEqual(change.path, ['weight'])) {
		return baseFormatter.formatScalarChange(
			change, _.startCase(change.path[0])
		);
	}

	if (_.isEqual(change.path, ['pages'])) {
		return baseFormatter.formatScalarChange(change, 'Page Count');
	}

	if (_.isEqual(change.path, ['editionFormat']) ||
			_.isEqual(change.path, ['editionFormat', 'label'])) {
		return baseFormatter.formatTypeChange(change, 'Edition Format');
	}

	if (_.isEqual(change.path, ['editionStatus']) ||
			_.isEqual(change.path, ['editionStatus', 'label'])) {
		return baseFormatter.formatTypeChange(change, 'Edition Status');
	}

	return null;
}

function formatPublisherChange(change) {
	if (_.isEqual(change.path, ['beginDate'])) {
		return baseFormatter.formatScalarChange(change, 'Begin Date');
	}

	if (_.isEqual(change.path, ['endDate'])) {
		return baseFormatter.formatScalarChange(change, 'End Date');
	}

	if (_.isEqual(change.path, ['ended'])) {
		return baseFormatter.formatEndedChange(change);
	}
	if (_.isEqual(change.path, ['publisherType']) ||
			_.isEqual(change.path, ['publisherType', 'label'])) {
		return baseFormatter.formatTypeChange(change, 'Publisher Type');
	}

	if (_.isEqual(change.path, ['area']) ||
			_.isEqual(change.path, ['area', 'name'])) {
		return baseFormatter.formatAreaChange(change);
	}

	return null;
}

function formatWorkChange(change) {
	if (languageSetFormatter.changed(change)) {
		return languageSetFormatter.format(change);
	}
	if (_.isEqual(change.path, ['workType']) ||
			_.isEqual(change.path, ['workType', 'label'])) {
		return baseFormatter.formatTypeChange(change, 'Work Type');
	}

	return null;
}

function formatEditionGroupChange(change) {
	if (_.isEqual(change.path, ['editionGroupType']) ||
			_.isEqual(change.path, ['editionGroupType', 'label'])) {
		return baseFormatter.formatTypeChange(change, 'Edition Group Type');
	}

	return [];
}

function diffRevisionsWithParents(orm, entityRevisions, entityType) {
	// entityRevisions - collection of *entityType*_revisions matching id
	return Promise.all(entityRevisions.map(
		(revision) => {
			const dataId = revision.get('dataId');
			return revision.parent()
				.then(
					(parent) => {
						let isNew = false;
						const isDeletion = !dataId;
						if (!parent) {
							isNew = Boolean(dataId);
						}
						return makePromiseFromObject({
							changes: revision.diff(parent),
							entity: revision.related('entity'),
							entityAlias: dataId ?
								revision.related('data').fetch({require: false, withRelated: ['aliasSet.defaultAlias', 'aliasSet.aliases']}) :
								orm.func.entity.getEntityParentAlias(
									orm, entityType, revision.get('bbid')
								),
							isDeletion,
							isNew,
							revision
						});
					},
					// If calling .parent() is rejected (no parent rev), we still want to go ahead without the parent
					() => makePromiseFromObject({
						changes: revision.diff(null),
						entity: revision.related('entity'),
						entityAlias: revision.get('dataId') ?
							revision.related('data').fetch({require: false, withRelated: ['aliasSet.defaultAlias', 'aliasSet.aliases']}) :
							orm.func.entity.getEntityParentAlias(
								orm, entityType, revision.get('bbid')
							),
						isDeletion: !dataId,
						isNew: Boolean(dataId),
						revision
					})
				);
		}
	));
}

router.get('/:id', async (req, res, next) => {
	const {
		AuthorRevision, EditionRevision, EditionGroupRevision,
		PublisherRevision, Revision, WorkRevision
	} = req.app.locals.orm;

	let revision;
	function _createRevision(EntityRevisionModel, entityType) {
		/**
		 * EntityRevisions can have duplicate ids
		 * the 'merge' and 'remove' options instructs the ORM to consider that normal instead of merging
		 * see https://github.com/bookshelf/bookshelf/pull/1846
		 */
		return EntityRevisionModel.forge()
			.where('id', req.params.id)
			.fetchAll({merge: false, remove: false, require: false, withRelated: 'entity'})
			.then((entityRevisions) => diffRevisionsWithParents(req.app.locals.orm, entityRevisions, entityType))
			.catch(err => { log.error(err); throw err; });
	}
	try {
		/*
		* Here, we need to get the Revision, then get all <Entity>Revision
		* objects with the same ID, formatting each revision individually, then
		* concatenating the diffs
		*/
		revision = await new Revision({id: req.params.id})
			.fetch({
				withRelated: [
					'author',
					'author.titleUnlock.title',
					{
						'notes'(q) {
							q.orderBy('note.posted_at');
						}
					},
					'notes.author',
					'notes.author.titleUnlock.title'
				]
			})
			.catch(Revision.NotFoundError, () => {
				throw new error.NotFoundError(`Revision #${req.params.id} not found`, req);
			});

		const authorDiffs = await _createRevision(AuthorRevision, 'Author');
		const editionDiffs = await _createRevision(EditionRevision, 'Edition');
		const editionGroupDiffs = await _createRevision(EditionGroupRevision, 'EditionGroup');
		const publisherDiffs = await _createRevision(PublisherRevision, 'Publisher');
		const workDiffs = await _createRevision(WorkRevision, 'Work');
		const diffs = _.concat(
			entityFormatter.formatEntityDiffs(
				authorDiffs,
				'Author',
				formatAuthorChange
			),
			entityFormatter.formatEntityDiffs(
				editionDiffs,
				'Edition',
				formatEditionChange
			),
			entityFormatter.formatEntityDiffs(
				editionGroupDiffs,
				'EditionGroup',
				formatEditionGroupChange
			),
			entityFormatter.formatEntityDiffs(
				publisherDiffs,
				'Publisher',
				formatPublisherChange
			),
			entityFormatter.formatEntityDiffs(
				workDiffs,
				'Work',
				formatWorkChange
			)
		);

		const props = generateProps(req, res, {
			diffs,
			revision: revision.toJSON(),
			title: 'RevisionPage'
		});

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<RevisionPage
					diffs={props.diffs}
					revision={props.revision}
					user={props.user}
				/>
			</Layout>
		);

		const script = '/js/revision.js';

		return res.send(target({
			markup,
			props: escapeProps(props),
			script
		}));
	}
	catch (err) {
		return next(err);
	}
});

router.post('/:id/note', (req, res) => {
	entityRoutes.addNoteToRevision(req, res);
});

export default router;
