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

	const languages = _.map(
		data.workSection.languages, (language) => language.value
	);

	return {
		aliases,
		annotation: data.annotationSection.content,
		disambiguation: data.nameSection.disambiguation,
		identifiers,
		languages,
		note: data.submissionSection.note,
		relationships,
		typeId: data.workSection.type
	};
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'work', transformNewForm, 'typeId'
);

const mergeHandler = makeEntityCreateOrEditHandler(
	'work', transformNewForm, 'typeId', true
);

/** ****************************
*********** Routes *************
*******************************/

const router = express.Router();

// Creation

router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages, middleware.loadWorkTypes,
	middleware.loadRelationshipTypes,
	(req, res, next) => {
		const {Author, Edition} = req.app.locals.orm;
		let relationshipTypeId;
		let initialRelationshipIndex = 0;
		const propsPromise = generateEntityProps(
			'work', req, res, {}
		);

		if (req.query.author) {
			propsPromise.author =
				Author.forge({bbid: req.query.author})
					.fetch({require: false, withRelated: 'defaultAlias'})
					.then((data) => data && utils.entityToOption(data.toJSON()));
		}

		if (req.query.edition) {
			propsPromise.edition =
				Edition.forge({bbid: req.query.edition})
					.fetch({require: false, withRelated: 'defaultAlias'})
					.then((data) => data && utils.entityToOption(data.toJSON()));
		}

		function render(props) {
			if (props.author) {
				// add initial ralationship with relationshipTypeId = 8 (<Work> is written by <Author>)
				relationshipTypeId = 8;
				addInitialRelationship(props, relationshipTypeId, initialRelationshipIndex++, props.author);
			}

			if (props.edition) {
				// add initial ralationship with relationshipTypeId = 10 (<Work> is contained in <Edition>)
				relationshipTypeId = 10;
				addInitialRelationship(props, relationshipTypeId, initialRelationshipIndex++, props.edition);
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
		'Work',
		['workType', 'languageSet.languages'],
		'Work not found'
	)
);

function _setWorkTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Work',
		utils.template`Work “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setWorkTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setWorkTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post(
	'/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {WorkHeader, WorkRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, WorkHeader, WorkRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {WorkRevision} = req.app.locals.orm;
	_setWorkTitle(res);
	entityRoutes.displayRevisions(req, res, next, WorkRevision);
});

router.get('/:bbid/revisions/revisions', (req, res, next) => {
	const {WorkRevision} = req.app.locals.orm;
	_setWorkTitle(res);
	entityRoutes.updateDisplayedRevisions(req, res, next, WorkRevision);
});


function workToFormState(work) {
	/** The front-end expects a language id rather than the language object. */
	const aliases = work.aliasSet ?
		work.aliasSet.aliases.map(({languageId, ...rest}) => ({
			...rest,
			language: languageId
		})) : [];

	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(work.aliasSet);
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
		work.disambiguation && work.disambiguation.comment;

	const identifiers = work.identifierSet ?
		work.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	const workSection = {
		languages: work.languageSet ? work.languageSet.languages.map(
			({id, name}) => ({label: name, value: id})
		) : [],
		type: work.workType && work.workType.id
	};

	const relationshipSection = {
		canEdit: true,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: {}
	};

	work.relationships.forEach((relationship) => (
		relationshipSection.relationships[relationship.id] = {
			relationshipType: relationship.type,
			rowID: relationship.id,
			sourceEntity: relationship.source,
			targetEntity: relationship.target
		}
	));

	const optionalSections = {};
	if (work.annotation) {
		optionalSections.annotationSection = work.annotation;
	}

	return {
		aliasEditor,
		buttonBar,
		identifierEditor,
		nameSection,
		relationshipSection,
		workSection,
		...optionalSections
	};
}

router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadWorkTypes, middleware.loadLanguages,
	 middleware.loadEntityRelationships, middleware.loadRelationshipTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'work', req, res, {}, workToFormState
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
