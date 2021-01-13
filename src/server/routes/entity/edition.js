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
import * as entityRoutes from './entity';
import * as middleware from '../../helpers/middleware';
import * as utils from '../../helpers/utils';

import {
	addInitialRelationship,
	entityEditorMarkup,
	generateEntityProps,
	makeEntityCreateOrEditHandler
} from '../../helpers/entityRouteUtils';

import _ from 'lodash';
import {escapeProps} from '../../helpers/props';
import express from 'express';
import {makePromiseFromObject} from '../../../common/helpers/utils';
import target from '../../templates/target';


/** ****************************
*********** Helpers ************
*******************************/

const additionalEditionProps = [
	'editionGroupBbid', 'width', 'height', 'depth', 'weight', 'pages',
	'formatId', 'statusId'
];

function transformNewForm(data) {
	const aliases = entityRoutes.constructAliases(
		data.aliasEditor, data.nameSection
	);

	const identifiers = entityRoutes.constructIdentifiers(
		data.identifierEditor
	);

	const relationships = entityRoutes.constructRelationships(
		data.relationshipSection
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
		annotation: data.annotationSection.content,
		depth: data.editionSection.depth &&
			parseInt(data.editionSection.depth, 10),
		disambiguation: data.nameSection.disambiguation,
		editionGroupBbid: data.editionSection.editionGroup &&
			data.editionSection.editionGroup.id,
		formatId: data.editionSection.format &&
			parseInt(data.editionSection.format, 10),
		height: data.editionSection.height &&
			parseInt(data.editionSection.height, 10),
		identifiers,
		languages,
		note: data.submissionSection.note,
		pages: data.editionSection.pages &&
			parseInt(data.editionSection.pages, 10),
		publishers: data.editionSection.publisher &&
			[data.editionSection.publisher.id],
		relationships,
		releaseEvents,
		statusId: data.editionSection.status &&
			parseInt(data.editionSection.status, 10),
		weight: data.editionSection.weight &&
			parseInt(data.editionSection.weight, 10),
		width: data.editionSection.width &&
			parseInt(data.editionSection.width, 10)
	};
}

function getInitialNameSection(entity) {
	return {
		disambiguation: entity.disambiguation,
		language: entity.defaultAlias.languageId,
		languageId: entity.defaultAlias.languageId,
		name: entity.defaultAlias.name,
		primary: entity.defaultAlias.primary,
		sortName: entity.defaultAlias.sortName
	};
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'edition', transformNewForm, additionalEditionProps
);

const mergeHandler = makeEntityCreateOrEditHandler(
	'edition', transformNewForm, additionalEditionProps, true
);

/** ****************************
*********** Routes *************
*******************************/
const router = express.Router();

// Creation

router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages, middleware.loadRelationshipTypes,
	(req, res, next) => {
		const {EditionGroup, Publisher, Work} = req.app.locals.orm;
		const propsPromise = generateEntityProps(
			'edition', req, res, {}
		);

		// Access edition-group property: can't write req.query.edition-group as the dash makes it invalid Javascript
		if (req.query['edition-group']) {
			propsPromise.editionGroup =
				EditionGroup.forge({bbid: req.query['edition-group']})
					.fetch({require: false, withRelated: 'defaultAlias'})
					.then((data) => data && utils.entityToOption(data.toJSON()));
		}

		if (req.query.publisher) {
			propsPromise.publisher =
				Publisher.forge({bbid: req.query.publisher})
					.fetch({require: false, withRelated: 'defaultAlias'})
					.then((data) => data && utils.entityToOption(data.toJSON()));
		}

		if (req.query.work) {
			propsPromise.work =
				Work.forge({bbid: req.query.work})
					.fetch({require: false, withRelated: 'defaultAlias'})
					.then((data) => data && utils.entityToOption(data.toJSON()));
		}

		function render(props) {
			const {initialState} = props;

			let relationshipTypeId;
			let initialRelationshipIndex = 0;

			if (props.publisher || props.editionGroup || props.work) {
				initialState.editionSection = {};
			}

			if (props.publisher) {
				initialState.editionSection.publisher = props.publisher;
				// add initial relationship with relationshipTypeId = 4 (<Publisher> published < New Edition>)
				relationshipTypeId = 4;
				addInitialRelationship(props, relationshipTypeId, initialRelationshipIndex++, props.publisher);
			}

			if (props.editionGroup) {
				initialState.editionSection.editionGroup = props.editionGroup;
				// add initial raltionship with relationshipTypeId = 3 (<New Edition> is an edition of <EditionGroup>)
				relationshipTypeId = 3;
				addInitialRelationship(props, relationshipTypeId, initialRelationshipIndex++, props.editionGroup);
			}

			if (props.work) {
				initialState.nameSection = getInitialNameSection(props.work);
				// add initial raltionship with relationshipTypeId = 10 (<New Edition> Contains <Work>)
				relationshipTypeId = 10;
				addInitialRelationship(props, relationshipTypeId, initialRelationshipIndex++, props.work);
			}

			const editorMarkup = entityEditorMarkup(props);
			const {markup} = editorMarkup;
			const updatedProps = editorMarkup.props;
			return res.send(target({
				markup,
				props: escapeProps(updatedProps),
				script: '/js/entity-editor.js',
				title: props.heading
			}));
		}

		makePromiseFromObject(propsPromise)
			.then(render)
			.catch(next);
	}
);

router.post('/create/handler', auth.isAuthenticatedForHandler,
	createOrEditHandler);

/* If the route specifies a BBID, make sure it does not redirect to another bbid then load the corresponding entity */
router.param(
	'bbid',
	middleware.redirectedBbid
);
router.param(
	'bbid',
	middleware.makeEntityLoader(
		'Edition',
		[
			'editionGroup.defaultAlias',
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

router.get('/:bbid/revisions/revisions', (req, res, next) => {
	const {EditionRevision} = req.app.locals.orm;
	_setEditionTitle(res);
	entityRoutes.updateDisplayedRevisions(req, res, next, EditionRevision);
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


function editionToFormState(edition) {
	/** The front-end expects a language id rather than the language object. */
	const aliases = edition.aliasSet ?
		edition.aliasSet.aliases.map(({languageId, ...rest}) => ({
			...rest,
			language: languageId
		})) : [];

	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(edition.aliasSet);
	const defaultAliasList = aliases.splice(defaultAliasIndex, 1);

	const aliasEditor = {};
	aliases.forEach((alias) => { aliasEditor[alias.id] = alias; });

	const buttonBar = {
		aliasEditorVisible: false,
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

	const releaseDate = edition.releaseEventSetId ?
		edition.releaseEventSet.releaseEvents[0].date : null;

	const publisher = edition.publisherSet && (
		_.isEmpty(edition.publisherSet.publishers) ?
			null : utils.entityToOption(edition.publisherSet.publishers[0])
	);

	const editionGroup = utils.entityToOption(edition.editionGroup);

	const editionSection = {
		depth: edition.depth,
		editionGroup,
		// Determines whether the EG can be left blank (an EG will be auto-created) for existing Editions
		editionGroupRequired: false,
		editionGroupVisible: true,
		format: edition.editionFormat && edition.editionFormat.id,
		height: edition.height,
		languages: edition.languageSet ? edition.languageSet.languages.map(
			({id, name}) => ({label: name, value: id})
		) : [],
		pages: edition.pages,
		physicalVisible,
		publisher,
		releaseDate,
		status: edition.editionStatus && edition.editionStatus.id,
		weight: edition.weight,
		width: edition.width
	};

	const relationshipSection = {
		canEdit: true,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: {}
	};

	edition.relationships.forEach((relationship) => (
		relationshipSection.relationships[relationship.id] = {
			relationshipType: relationship.type,
			rowID: relationship.id,
			sourceEntity: relationship.source,
			targetEntity: relationship.target
		}
	));

	const optionalSections = {};
	if (edition.annotation) {
		optionalSections.annotationSection = edition.annotation;
	}

	return {
		aliasEditor,
		buttonBar,
		editionSection,
		identifierEditor,
		nameSection,
		relationshipSection,
		...optionalSections
	};
}

router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadEditionStatuses, middleware.loadEditionFormats,
	middleware.loadLanguages, middleware.loadEntityRelationships,
	middleware.loadRelationshipTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'edition', req, res, {}, editionToFormState
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: props.heading
		}));
	}
);

router.post('/:bbid/edit/handler', auth.isAuthenticatedForHandler,
	createOrEditHandler);

router.post('/:bbid/merge/handler', auth.isAuthenticatedForHandler,
	mergeHandler);

export default router;
