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

// @flow

import * as baseFormatter from '../helpers/diffFormatters/base';
import * as entityFormatter from '../helpers/diffFormatters/entity';
import * as entityRoutes from './entity/entity';
import * as languageSetFormatter from '../helpers/diffFormatters/languageSet';
import * as propHelpers from '../../client/helpers/props';
import * as publisherSetFormatter from '../helpers/diffFormatters/publisherSet';
import * as releaseEventSetFormatter from
	'../helpers/diffFormatters/releaseEventSet';
import * as utils from '../helpers/utils';

import {escapeProps, generateProps} from '../helpers/props';

import Layout from '../../client/containers/layout';
import MergePage from '../../client/components/pages/merge';
import Promise from 'bluebird';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

function formatCreatorChange(change) {
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

	if (_.isEqual(change.path, ['type'])) {
		return baseFormatter.formatTypeChange(change, 'Creator Type');
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
	if (_.isEqual(change.path, ['publicationBbid'])) {
		return baseFormatter.formatScalarChange(change, 'Publication');
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

	if (_.isEqual(change.path, ['editionFormat'])) {
		return baseFormatter.formatTypeChange(change, 'Edition Format');
	}

	if (_.isEqual(change.path, ['editionStatus'])) {
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

	if (_.isEqual(change.path, ['type'])) {
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

	if (_.isEqual(change.path, ['type'])) {
		return baseFormatter.formatTypeChange(change, 'Work Type');
	}

	return null;
}

function formatPublicationChange(change) {
	if (_.isEqual(change.path, ['type'])) {
		return baseFormatter.formatTypeChange(change, 'Publication Type');
	}

	return [];
}

function diffEntities(entities) {
	// entities - collection of entities matching id
	const rev0 = entities[0].related('revision');
	return Promise.all(entities
		.map(entity => {
			const rev = entity.related('revision');
			return Promise.props({
				changes: rev0.diff(rev),
				entity
			});
		}));
}

async function getEntityByBBID(orm, transacting, bbid) {
	const entityHeader = await orm.Entity.forge({bbid}).fetch({transacting});

	const model = utils.getEntityModelByType(orm, entityHeader.get('type'));
	return model.forge({bbid}).fetch({transacting, withRelated: 'revision'});
}

router.get('/*', async (req, res, next) => {
	const {orm}: {orm: any} = req.app.locals;
	const {
		Creator, Edition, Publication,
		Publisher, Revision, Work,
		bookshelf, Entity
	} = orm;

	const bbids = req.params[0].split('/');

	if (bbids.length < 2) {
		return next('Merging requires to have more than one bbid passed, separated by a "/"');
	}
	// function _createRevision(model) {
	// 	// return model.forge()
	// 	// 	.where('bbid', bbids[0])
	// 	// 	.fetchAll({withRelated: ['entity']})
	// 	// 	.then(diffRevisionsWithParents);
	// 	const promises = bbids.map(bbid => model.forge({bbid})
	// 		// .where('bbid', 'IN', bbids)
	// 		.where('master', true)
	// 		.fetchAll({withRelated: ['revision']}));
	// /* eslint no-console:0 */
	// 	console.log('createrevision promises', promises);
	// 	return Promise.all(promises).then(diffEntities).catch(next);
	// }
	// const entities = await Promise.all(bbids.map(
	// 	(bbid) => Entity.forge({bbid}).fetchAll({withRelated: ['entity']})
	// 	));
	// let entities;
	// await bookshelf.transaction(async (transacting) => {
	// 	entities = await Promise.all(bbids.map(
	// 		(bbid) =>
	// 			getEntityByBBID(orm, transacting, bbid)
	// 	));
	// });

	// const uniqueEntityTypes = _.uniqBy(entities, 'type');
	// const areEntitiesSameModel = uniqueEntityTypes.length === 1;
	// if (!areEntitiesSameModel) {
	// 	console.log("/merge areEntitiesSameModel false! uniqueEntityTypes:", uniqueEntityTypes);//eslint-disable-line
	// 	return next('You can only merge entities of the same type');
	// }


	// const creatorDiffsPromise = _createRevision(Creator);
	// const editionDiffsPromise = _createRevision(Edition);
	// const publicationDiffsPromise = _createRevision(Publication);
	// const publisherDiffsPromise = _createRevision(Publisher);
	// const workDiffsPromise = _createRevision(Work);
	let entityDiffs;
	await bookshelf.transaction(async (transacting) => {
		entityDiffs = await Promise.all(bbids.map(
			(bbid) =>
				getEntityByBBID(orm, transacting, bbid)
		))
			.then(diffEntities);
	});

	console.log('entityDiffs',entityDiffs); //eslint-disable-line

	const diffs = entityFormatter.formatEntityDiffs(
		entityDiffs,
		'Creator',
		formatCreatorChange
	);

	console.log('diffs', diffs); //eslint-disable-line

	const props = generateProps(req, res, {
		diffs,
		title: 'MergePage'
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<MergePage
				diffs={props.diffs}
				user={props.user}
			/>
		</Layout>
	);
	const script = '/js/merge.js';
	return res.send(target({
		markup,
		props: escapeProps(props),
		script
	}));
});

export default router;
