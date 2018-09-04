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

/* If the route specifies a BBID, load the Creator for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Creator',
		['creatorType', 'gender', 'beginArea', 'endArea'],
		'Creator not found'
	)
);

function _setCreatorTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Creator',
		utils.template`Creator “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setCreatorTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setCreatorTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post(
	'/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {CreatorHeader, CreatorRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, CreatorHeader, CreatorRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {CreatorRevision} = req.app.locals.orm;
	_setCreatorTitle(res);
	entityRoutes.displayRevisions(req, res, next, CreatorRevision);
});

// Creation
router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadGenders,	middleware.loadLanguages,
	middleware.loadCreatorTypes, (req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'creator', req, res, {
				genderOptions: res.locals.genders
			}
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Add Creator'
		}));
	}
);

function creatorToFormState(creator) {
	const aliases = creator.aliasSet ?
		creator.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(aliases);
	const defaultAliasList = aliases.splice(defaultAliasIndex, 1);

	const aliasEditor = {};
	aliases.forEach((alias) => { aliasEditor[alias.id] = alias; });

	const buttonBar = {
		aliasEditorVisible: false,
		disambiguationVisible: Boolean(creator.disambiguation),
		identifierEditorVisible: false
	};

	const nameSection = _.isEmpty(defaultAliasList) ? {
		language: null,
		name: '',
		sortName: ''
	} : defaultAliasList[0];
	nameSection.disambiguation =
		creator.disambiguation && creator.disambiguation.comment;

	const identifiers = creator.identifierSet ?
		creator.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	const creatorSection = {
		beginArea: entityRoutes.areaToOption(creator.beginArea),
		beginDate: creator.beginDate,
		endArea: entityRoutes.areaToOption(creator.endArea),
		endDate: creator.endDate,
		ended: creator.ended,
		gender: creator.gender && creator.gender.id,
		type: creator.creatorType && creator.creatorType.id
	};

	return {
		aliasEditor,
		buttonBar,
		creatorSection,
		identifierEditor,
		nameSection
	};
}


router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadGenders, middleware.loadLanguages,
	middleware.loadCreatorTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'creator', req, res, {
				genderOptions: res.locals.genders
			}, creatorToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Edit Creator'
		}));
	}
);

const additionalCreatorProps = [
	'typeId', 'genderId', 'beginAreaId', 'beginDate', 'endDate', 'ended',
	'endAreaId'
];


function transformNewForm(data) {
	const aliases = entityRoutes.constructAliases(
		data.aliasEditor, data.nameSection
	);

	const identifiers = entityRoutes.constructIdentifiers(
		data.identifierEditor
	);

	return {
		aliases,
		beginAreaId: data.creatorSection.beginArea &&
			data.creatorSection.beginArea.id,
		beginDate: data.creatorSection.beginDate,
		disambiguation: data.nameSection.disambiguation,
		endAreaId: data.creatorSection.endArea &&
			data.creatorSection.endArea.id,
		endDate: data.creatorSection.ended ? data.creatorSection.endDate : '',
		ended: data.creatorSection.ended,
		genderId: data.creatorSection.gender,
		identifiers,
		note: data.submissionSection.note,
		typeId: data.creatorSection.type
	};
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'creator', transformNewForm, additionalCreatorProps
);

router.post('/create/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'create'));

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'edit'));

export default router;
