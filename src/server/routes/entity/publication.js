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
import * as propHelpers from '../../helpers/props';
import * as utils from '../../helpers/utils';
import EntityEditor from '../../../client/entity-editor/entity-editor';
import Immutable from 'immutable';
import Layout from '../../../client/containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import {createStore} from 'redux';
import express from 'express';


const {createRootReducer, getEntitySection} = entityEditorHelpers;

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
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublicationTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
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

router.get('/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadPublicationTypes, (req, res) => {
		const props = propHelpers.generateProps(req, res, {
			entityType: 'publication',
			heading: 'Create Publication',
			identifierTypes: res.locals.identifierTypes,
			initialState: {},
			languageOptions: res.locals.languages,
			publicationTypes: res.locals.publicationTypes,
			requiresJS: true,
			subheading: 'Add a new Publication to BookBrainz',
			submissionUrl: '/publication/create/handler'
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
					<EntityEditor {...propHelpers.extractChildProps(rest)}>
						<EntitySection/>
					</EntityEditor>
				</Provider>
			</Layout>
		);

		props.initialState = store.getState();

		return res.render('target', {
			markup,
			props,
			script: '/js/entity-editor.js',
			title: 'Add Publisher'
		});
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
		type: publication.publicationType && {
			label: publication.publicationType.label,
			value: publication.publicationType.id
		}
	};

	return {
		aliasEditor,
		buttonBar,
		identifierEditor,
		nameSection,
		publicationSection
	};
}

router.get('/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublicationTypes, middleware.loadLanguages, (req, res) => {
		const publication = res.locals.entity;

		const props = propHelpers.generateProps(req, res, {
			entityType: 'publication',
			heading: 'Edit Publication',
			identifierTypes: res.locals.identifierTypes,
			initialState: publicationToFormState(publication),
			languageOptions: res.locals.languages,
			publicationTypes: res.locals.publicationTypes,
			requiresJS: true,
			subheading: 'Edit an existing Publication in BookBrainz',
			submissionUrl: `/publication/${publication.bbid}/edit/handler`
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
					<EntityEditor {...propHelpers.extractChildProps(rest)}>
						<EntitySection/>
					</EntityEditor>
				</Provider>
			</Layout>
		);

		props.initialState = store.getState();

		return res.render('target', {
			markup,
			props,
			script: '/js/entity-editor.js',
			title: 'Edit Publication'
		});
	}
);

function transformNewForm(data) {
	let aliases = _.map(data.aliasEditor, ({language, name, sortName}) => ({
		default: false,
		languageId: language,
		name,
		sortName
	}));

	aliases = [{
		default: true,
		languageId: data.nameSection.language,
		name: data.nameSection.name,
		primary: true,
		sortName: data.nameSection.sortName
	}, ...aliases];

	const identifiers = _.map(data.identifierEditor, ({type, ...rest}) => ({
		typeId: type,
		...rest
	}));

	return {
		aliases,
		disambiguation: data.publicationSection.disambiguation,
		identifiers,
		note: data.submissionSection.note,
		typeId: data.publicationSection.type &&
			data.publicationSection.type.value
	};
}

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) => {
	req.body = transformNewForm(req.body);
	return entityRoutes.createEntity(
		req, res, 'Publication', _.pick(req.body, 'typeId')
	);
});

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		req.body = transformNewForm(req.body);
		return entityRoutes.editEntity(
			req, res, 'Publication', _.pick(req.body, 'typeId')
		);
	}
);

export default router;
