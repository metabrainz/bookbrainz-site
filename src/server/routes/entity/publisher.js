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
import * as propHelpers from '../../helpers/props';
import * as utils from '../../helpers/utils';
import EntityEditor from '../../../client/entity-editor/entity-editor';
import {FormSubmissionError} from '../../helpers/error';
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
			entityRoutes.displayEntity(req, res);
		})
		.catch(next);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setPublisherTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post('/:bbid/delete/handler', auth.isAuthenticatedForHandler,
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

router.get('/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadPublisherTypes,
	(req, res) => {
		const props = propHelpers.generateProps(req, res, {
			entityType: 'publisher',
			heading: 'Create Publisher',
			identifierTypes: res.locals.identifierTypes,
			initialState: {},
			languageOptions: res.locals.languages,
			publisherTypes: res.locals.publisherTypes,
			requiresJS: true,
			subheading: 'Add a new Publisher to BookBrainz',
			submissionUrl: '/publisher/create/handler'
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

function publisherToFormState(publisher) {
	const aliases = publisher.aliasSet ?
		publisher.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const defaultAliasIndex = getDefaultAliasIndex(aliases);
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
		area: areaToOption(publisher.area),
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

router.get('/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadPublisherTypes, middleware.loadLanguages,
	(req, res) => {
		const publisher = res.locals.entity;

		const props = propHelpers.generateProps(req, res, {
			entityType: 'publisher',
			heading: 'Edit Publisher',
			identifierTypes: res.locals.identifierTypes,
			initialState: publisherToFormState(publisher),
			languageOptions: res.locals.languages,
			publisherTypes: res.locals.publisherTypes,
			requiresJS: true,
			subheading: 'Edit an existing Publisher in BookBrainz',
			submissionUrl: `/publisher/${publisher.bbid}/edit/handler`
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
			props,
			script: '/js/entity-editor.js',
			title: 'Add Publisher'
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

router.post('/create/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const validate = getValidator('publisher');
	if (!validate(req.body)) {
		const err = new FormSubmissionError();
		error.sendErrorAsJSON(res, err);
	}

	req.body = transformNewForm(req.body);
	return entityRoutes.createEntity(
		req, res, 'Publisher', _.pick(req.body, additionalPublisherProps)
	);
});

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const validate = getValidator('publisher');
		if (!validate(req.body)) {
			const err = new FormSubmissionError();
			error.sendErrorAsJSON(res, err);
		}

		req.body = transformNewForm(req.body);
		return entityRoutes.editEntity(
			req, res, 'Publisher', _.pick(req.body, additionalPublisherProps)
		);
	}
);

export default router;
