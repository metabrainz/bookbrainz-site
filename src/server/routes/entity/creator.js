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
import * as propHelpers from '../../../client/helpers/props';
import * as utils from '../../helpers/utils';
import {escapeProps, generateProps} from '../../helpers/props';
import EntityEditor from '../../../client/entity-editor/entity-editor';
import Immutable from 'immutable';
import Layout from '../../../client/containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import {createStore} from 'redux';
import express from 'express';


const {createRootReducer, getEntitySection, getValidator} = entityEditorHelpers;

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
		const props = generateProps(req, res, {
			creatorTypes: res.locals.creatorTypes,
			entityType: 'creator',
			genderOptions: res.locals.genders,
			heading: 'Create Creator',
			identifierTypes: res.locals.identifierTypes,
			initialState: {},
			languageOptions: res.locals.languages,
			requiresJS: true,
			subheading: 'Add a new Creator to BookBrainz',
			submissionUrl: '/creator/create/handler'
		});

		const {initialState, ...rest} = props;

		const rootReducer = createRootReducer(props.entityType);

		const store = createStore(
			rootReducer,
			Immutable.fromJS(initialState)
		);

		const EntitySection = getEntitySection(props.entityType);

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(rest)}>
				<Provider store={store}>
					<EntityEditor
						validate={getValidator(props.entityType)}
						{...propHelpers.extractChildProps(rest)}
					>
						<EntitySection/>
					</EntityEditor>
				</Provider>
			</Layout>
		);

		props.initialState = store.getState();

		return res.render('target', {
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Add Creator'
		});
	}
);

function getDefaultAliasIndex(aliases) {
	const index = aliases.findIndex((alias) => alias.default);
	return index > 0 ? index : 0;
}

function areaToOption(area) {
	if (!area) {
		return null;
	}

	const {id} = area;

	return {
		disambiguation: area.comment,
		id,
		text: area.name,
		type: 'area'
	};
}

function creatorToFormState(creator) {
	const aliases = creator.aliasSet ?
		creator.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const defaultAliasIndex = getDefaultAliasIndex(aliases);
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
		beginArea: areaToOption(creator.beginArea),
		beginDate: creator.beginDate,
		endArea: areaToOption(creator.endArea),
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
		const creator = res.locals.entity;

		const props = generateProps(req, res, {
			creator,
			creatorTypes: res.locals.creatorTypes,
			entityType: 'creator',
			genderOptions: res.locals.genders,
			heading: 'Edit Creator',
			identifierTypes: res.locals.identifierTypes,
			initialState: creatorToFormState(creator),
			languageOptions: res.locals.languages,
			requiresJS: true,
			subheading: 'Edit an existing Creator in BookBrainz',
			submissionUrl: `/creator/${creator.bbid}/edit/handler`
		});

		const {initialState, ...rest} = props;

		const rootReducer = createRootReducer(props.entityType);

		const store = createStore(
			rootReducer,
			Immutable.fromJS(initialState)
		);

		const EntitySection = getEntitySection(props.entityType);

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(rest)}>
				<Provider store={store}>
					<EntityEditor
						validate={getValidator(props.entityType)}
						{...propHelpers.extractChildProps(rest)}
					>
						<EntitySection/>
					</EntityEditor>
				</Provider>
			</Layout>
		);

		props.initialState = store.getState();

		return res.render('target', {
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Edit Creator'
		});
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

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const validate = getValidator('creator');
	if (!validate(req.body)) {
		const err = new error.FormSubmissionError();
		error.sendErrorAsJSON(res, err);
	}

	req.body = transformNewForm(req.body);
	return entityRoutes.createEntity(
		req, res, 'Creator', _.pick(req.body, additionalCreatorProps)
	);
});

router.post(
	'/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const validate = getValidator('creator');
		if (!validate(req.body)) {
			const err = new error.FormSubmissionError();
			error.sendErrorAsJSON(res, err);
		}

		req.body = transformNewForm(req.body);
		return entityRoutes.editEntity(
			req, res, 'Creator', _.pick(req.body, additionalCreatorProps)
		);
	}
);

export default router;
