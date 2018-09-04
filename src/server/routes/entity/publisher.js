/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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

import * as auth from '../../helpers/auth';
import * as entityEditorHelpers from '../../../client/entity-editor/helpers';
import * as entityRoutes from './entity';
import * as error from '../../helpers/error';
import * as middleware from '../../helpers/middleware';
import * as utils from '../../helpers/utils';
import {
	entityEditorMarkup,
	generateEntityProps,
	makeEntityCreateOrEditHandler
} from '../../helpers/entityRouteUtils';
import _ from 'lodash';
import {escapeProps} from '../../helpers/props';
import express from 'express';
import target from '../../templates/target';


const {getValidator} = entityEditorHelpers;

const router = express.Router();

/* If the route specifies a BBID, load the Publisher for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Publisher',
		['publisherType', 'area'],
		'Publisher not found'
	)
);

function _setPublisherTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Publisher',
		utils.template`Publisher “${'name'}”`
	);
}


router.get('/:bbid', middleware.loadEntityRelationships, (req, res, next) => {
	// Fetch editions
	const {Publisher} = req.app.locals.orm;
	const editionRelationsToFetch = [
		'defaultAlias', 'disambiguation', 'releaseEventSet.releaseEvents'
	];
	const editionsPromise =
		Publisher.forge({bbid: res.locals.entity.bbid})
			.editions({withRelated: editionRelationsToFetch});

	return editionsPromise
		.then((editions) => {
			res.locals.entity.editions = editions.toJSON();
			_setPublisherTitle(res);
			res.locals.entity.editions.sort(entityRoutes.compareEntitiesByDate);
			entityRoutes.displayEntity(req, res);
		})
		.catch(next);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublisherTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post(
	'/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {PublisherHeader, PublisherRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, PublisherHeader, PublisherRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {PublisherRevision} = req.app.locals.orm;
	_setPublisherTitle(res);
	entityRoutes.displayRevisions(req, res, next, PublisherRevision);
});

// Creation

router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadPublisherTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'publisher', req, res, {}
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Add Publisher'
		}));
	}
);

function publisherToFormState(publisher) {
	const aliases = publisher.aliasSet ?
		publisher.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(aliases);
	const defaultAliasList = aliases.splice(defaultAliasIndex, 1);

	const aliasEditor = {};
	aliases.forEach((alias) => { aliasEditor[alias.id] = alias; });

	const buttonBar = {
		aliasEditorVisible: false,
		disambiguationVisible: Boolean(publisher.disambiguation),
		identifierEditorVisible: false
	};

	const nameSection = _.isEmpty(defaultAliasList) ? {
		language: null,
		name: '',
		sortName: ''
	} : defaultAliasList[0];
	nameSection.disambiguation =
		publisher.disambiguation && publisher.disambiguation.comment;

	const identifiers = publisher.identifierSet ?
		publisher.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	const publisherSection = {
		area: entityRoutes.areaToOption(publisher.area),
		beginDate: publisher.beginDate,
		endDate: publisher.endDate,
		ended: publisher.ended,
		type: publisher.publisherType && publisher.publisherType.id
	};

	return {
		aliasEditor,
		buttonBar,
		identifierEditor,
		nameSection,
		publisherSection
	};
}

router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublisherTypes, middleware.loadLanguages,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'publisher', req, res, {}, publisherToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Add Publisher'
		}));
	}
);


function transformNewForm(data) {
	const aliases = entityRoutes.constructAliases(
		data.aliasEditor, data.nameSection
	);

	const identifiers = entityRoutes.constructIdentifiers(
		data.identifierEditor
	);

	return {
		aliases,
		areaId: data.publisherSection.area && data.publisherSection.area.id,
		beginDate: data.publisherSection.beginDate,
		disambiguation: data.nameSection.disambiguation,
		endDate: data.publisherSection.ended ?
			data.publisherSection.endDate : '',
		ended: data.publisherSection.ended,
		identifiers,
		note: data.submissionSection.note,
		typeId: data.publisherSection.type
	};
}

const additionalPublisherProps = [
	'typeId', 'areaId', 'beginDate', 'endDate', 'ended'
];

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'publisher', transformNewForm, additionalPublisherProps);

router.post('/create/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'create'));

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'edit'));

export default router;
