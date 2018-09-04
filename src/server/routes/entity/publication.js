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

/* If the route specifies a BBID, load the Publication for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Publication',
		[
			'publicationType',
			'editions.defaultAlias',
			'editions.disambiguation',
			'editions.releaseEventSet.releaseEvents'
		],
		'Publication not found'
	)
);

function _setPublicationTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Publication',
		utils.template`Publication “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setPublicationTitle(res);
	res.locals.entity.editions.sort(entityRoutes.compareEntitiesByDate);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublicationTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post(
	'/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {PublicationHeader, PublicationRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, PublicationHeader, PublicationRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {PublicationRevision} = req.app.locals.orm;
	_setPublicationTitle(res);
	entityRoutes.displayRevisions(req, res, next, PublicationRevision);
});

// Creation

router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadPublicationTypes, (req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'publication', req, res, {}
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Add Publication'
		}));
	}
);


function getDefaultAliasIndex(aliases) {
	const index = aliases.findIndex((alias) => alias.default);
	return index > 0 ? index : 0;
}

function publicationToFormState(publication) {
	const aliases = publication.aliasSet ?
		publication.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const defaultAliasIndex = getDefaultAliasIndex(aliases);
	const defaultAliasList = aliases.splice(defaultAliasIndex, 1);

	const aliasEditor = {};
	aliases.forEach((alias) => { aliasEditor[alias.id] = alias; });

	const buttonBar = {
		aliasEditorVisible: false,
		disambiguationVisible: Boolean(publication.disambiguation),
		identifierEditorVisible: false
	};

	const nameSection = _.isEmpty(defaultAliasList) ? {
		language: null,
		name: '',
		sortName: ''
	} : defaultAliasList[0];
	nameSection.disambiguation =
		publication.disambiguation && publication.disambiguation.comment;

	const identifiers = publication.identifierSet ?
		publication.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	const publicationSection = {
		type: publication.publicationType && publication.publicationType.id
	};

	return {
		aliasEditor,
		buttonBar,
		identifierEditor,
		nameSection,
		publicationSection
	};
}

router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublicationTypes, middleware.loadLanguages,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'publication', req, res, {}, publicationToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Edit Publication'
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
		disambiguation: data.nameSection.disambiguation,
		identifiers,
		note: data.submissionSection.note,
		typeId: data.publicationSection.type
	};
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'publication', transformNewForm, 'typeId');

router.post('/create/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'create'));

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'edit'));

export default router;
