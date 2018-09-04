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
import Promise from 'bluebird';
import _ from 'lodash';
import {escapeProps} from '../../helpers/props';
import express from 'express';
import target from '../../templates/target';


const {getValidator} = entityEditorHelpers;

const router = express.Router();

/* If the route specifies a BBID, load the Edition for it. */
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Edition',
		[
			'publication.defaultAlias',
			'languageSet.languages',
			'editionFormat',
			'editionStatus',
			'releaseEventSet.releaseEvents',
			'publisherSet.publishers.defaultAlias'
		],
		'Edition not found'
	)
);

function _setEditionTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Edition',
		utils.template`Edition “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setEditionTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/revisions', (req, res, next) => {
	const {EditionRevision} = req.app.locals.orm;
	_setEditionTitle(res);
	entityRoutes.displayRevisions(req, res, next, EditionRevision);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setEditionTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post(
	'/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {EditionHeader, EditionRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, EditionHeader, EditionRevision
		);
	}
);

function entityToOption(entity) {
	return {
		disambiguation: entity.disambiguation ?
			entity.disambiguation.comment : null,
		id: entity.bbid,
		text: entity.defaultAlias ?
			entity.defaultAlias.name : '(unnamed)',
		type: entity.type
	};
}


// Creation

router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages,
	(req, res, next) => {
		const {Publication, Publisher} = req.app.locals.orm;
		const propsPromise = generateEntityProps(
			'edition', req, res, {}
		);

		if (req.query.publication) {
			propsPromise.publication =
				Publication.forge({bbid: req.query.publication})
					.fetch({withRelated: 'defaultAlias'})
					.then((data) => entityToOption(data.toJSON()));
		}

		if (req.query.publisher) {
			propsPromise.publisher =
				Publisher.forge({bbid: req.query.publisher})
					.fetch({withRelated: 'defaultAlias'})
					.then((data) => entityToOption(data.toJSON()));
		}

		function render(props) {
			const {initialState, ...rest} = props;

			if (props.publisher || props.publication) {
				initialState.editionSection = {};
			}

			if (props.publisher) {
				initialState.editionSection.publisher = props.publisher;
			}

			if (props.publication) {
				initialState.editionSection.publication = props.publication;
			}

			const editorMarkup = entityEditorMarkup(props);
			const {markup} = editorMarkup;
			const updatedProps = editorMarkup.props;
			return res.send(target({
				markup,
				props: escapeProps(updatedProps),
				script: '/js/entity-editor.js',
				title: 'Add Edition'
			}));
		}

		Promise.props(propsPromise)
			.then(render)
			.catch(next);
	}
);


function getDefaultAliasIndex(aliases) {
	const index = aliases.findIndex((alias) => alias.default);
	return index > 0 ? index : 0;
}

function editionToFormState(edition) {
	const aliases = edition.aliasSet ?
		edition.aliasSet.aliases.map(({language, ...rest}) => ({
			language: language.id,
			...rest
		})) : [];

	const defaultAliasIndex = getDefaultAliasIndex(aliases);
	const defaultAliasList = aliases.splice(defaultAliasIndex, 1);

	const aliasEditor = {};
	aliases.forEach((alias) => { aliasEditor[alias.id] = alias; });

	const buttonBar = {
		aliasEditorVisible: false,
		disambiguationVisible: Boolean(edition.disambiguation),
		identifierEditorVisible: false
	};

	const nameSection = _.isEmpty(defaultAliasList) ? {
		language: null,
		name: '',
		sortName: ''
	} : defaultAliasList[0];
	nameSection.disambiguation =
		edition.disambiguation && edition.disambiguation.comment;

	const identifiers = edition.identifierSet ?
		edition.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	const physicalVisible = !(
		_.isNull(edition.depth) && _.isNull(edition.height) &&
		_.isNull(edition.pages) && _.isNull(edition.weight) &&
		_.isNull(edition.width)
	);

	const releaseDate = edition.releaseEventSet && (
		_.isEmpty(edition.releaseEventSet.releaseEvents) ?
			null : edition.releaseEventSet.releaseEvents[0].date
	);

	const publisher = edition.publisherSet && (
		_.isEmpty(edition.publisherSet.publishers) ?
			null : entityToOption(edition.publisherSet.publishers[0])
	);

	const publication = entityToOption(edition.publication);

	const editionSection = {
		depth: edition.depth,
		format: edition.editionFormat && edition.editionFormat.id,
		height: edition.height,
		languages: edition.languageSet ? edition.languageSet.languages.map(
			({id, name}) => ({label: name, value: id})
		) : [],
		pages: edition.pages,
		physicalVisible,
		publication,
		publisher,
		releaseDate,
		status: edition.editionStatus && edition.editionStatus.id,
		weight: edition.weight,
		width: edition.width
	};

	return {
		aliasEditor,
		buttonBar,
		editionSection,
		identifierEditor,
		nameSection
	};
}

router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'edition', req, res, {}, editionToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: 'Edit Edition'
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

	let releaseEvents = [];
	if (data.editionSection.releaseDate) {
		releaseEvents = [{date: data.editionSection.releaseDate}];
	}

	const languages = _.map(
		data.editionSection.languages, (language) => language.value
	);

	return {
		aliases,
		depth: data.editionSection.depth &&
			parseInt(data.editionSection.depth, 10),
		disambiguation: data.nameSection.disambiguation,
		formatId: data.editionSection.format &&
			parseInt(data.editionSection.format, 10),
		height: data.editionSection.height &&
			parseInt(data.editionSection.height, 10),
		identifiers,
		languages,
		note: data.submissionSection.note,
		pages: data.editionSection.pages &&
			parseInt(data.editionSection.pages, 10),
		publicationBbid: data.editionSection.publication &&
			data.editionSection.publication.id,
		publishers: data.editionSection.publisher &&
			[data.editionSection.publisher.id],
		releaseEvents,
		statusId: data.editionSection.status &&
			parseInt(data.editionSection.status, 10),
		weight: data.editionSection.weight &&
			parseInt(data.editionSection.weight, 10),
		width: data.editionSection.width &&
			parseInt(data.editionSection.width, 10)
	};
}

const additionalEditionProps = [
	'publicationBbid', 'width', 'height', 'depth', 'weight', 'pages',
	'formatId', 'statusId'
];

function getAdditionalEditionSets(orm) {
	const {LanguageSet, PublisherSet, ReleaseEventSet} = orm;
	return [
		{
			entityIdField: 'languageSetId',
			idField: 'id',
			model: LanguageSet,
			name: 'languageSet',
			propName: 'languages'
		},
		{
			entityIdField: 'publisherSetId',
			idField: 'bbid',
			model: PublisherSet,
			name: 'publisherSet',
			propName: 'publishers'
		},
		{
			entityIdField: 'releaseEventSetId',
			idField: 'id',
			model: ReleaseEventSet,
			mutableFields: [
				'date',
				'areaId'
			],
			name: 'releaseEventSet',
			propName: 'releaseEvents'
		}
	];
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'edition', transformNewForm, additionalEditionProps, (req, res) =>
		getAdditionalEditionSets(req.app.locals.orm));

router.post('/create/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'create'));

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	_.partial(createOrEditHandler, 'edit'));

export default router;
