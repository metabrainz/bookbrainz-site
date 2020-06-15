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
	entityEditorMarkup,
	generateEntityProps,
	makeEntityCreateOrEditHandler
} from '../../helpers/entityRouteUtils';

import _ from 'lodash';
import {escapeProps} from '../../helpers/props';
import express from 'express';
import target from '../../templates/target';


/** ****************************
*********** Helpers ************
*******************************/

const additionalAuthorProps = [
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

	const relationships = entityRoutes.constructRelationships(
		data.relationshipSection
	);

	return {
		aliases,
		annotation: data.annotationSection.content,
		beginAreaId: data.authorSection.beginArea &&
			data.authorSection.beginArea.id,
		beginDate: data.authorSection.beginDate,
		disambiguation: data.nameSection.disambiguation,
		endAreaId: data.authorSection.endArea &&
			data.authorSection.endArea.id,
		endDate: data.authorSection.endDate ? data.authorSection.endDate : null,
		ended: data.authorSection.ended,
		genderId: data.authorSection.gender,
		identifiers,
		note: data.submissionSection.note,
		relationships,
		typeId: data.authorSection.type
	};
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'author', transformNewForm, additionalAuthorProps
);

const mergeHandler = makeEntityCreateOrEditHandler(
	'author', transformNewForm, additionalAuthorProps, true
);

/** ****************************
*********** Routes ************
*******************************/

const router = express.Router();

// Creation
router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadGenders, middleware.loadLanguages,
	middleware.loadAuthorTypes, middleware.loadRelationshipTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'author', req, res, {
				genderOptions: res.locals.genders
			}
		));

		return res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/entity-editor.js',
			title: props.heading
		}));
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
		'Author',
		['authorType', 'gender', 'beginArea', 'endArea'],
		'Author not found'
	)
);

function _setAuthorTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Author',
		utils.template`Author “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, (req, res) => {
	_setAuthorTitle(res);
	entityRoutes.displayEntity(req, res);
});

router.get('/:bbid/delete', auth.isAuthenticated, (req, res) => {
	_setAuthorTitle(res);
	entityRoutes.displayDeleteEntity(req, res);
});

router.post(
	'/:bbid/delete/handler', auth.isAuthenticatedForHandler,
	(req, res) => {
		const {orm} = req.app.locals;
		const {AuthorHeader, AuthorRevision} = orm;
		return entityRoutes.handleDelete(
			orm, req, res, AuthorHeader, AuthorRevision
		);
	}
);

router.get('/:bbid/revisions', (req, res, next) => {
	const {AuthorRevision} = req.app.locals.orm;
	_setAuthorTitle(res);
	entityRoutes.displayRevisions(req, res, next, AuthorRevision);
});

router.get('/:bbid/revisions/revisions', (req, res, next) => {
	const {AuthorRevision} = req.app.locals.orm;
	_setAuthorTitle(res);
	entityRoutes.updateDisplayedRevisions(req, res, next, AuthorRevision);
});


function authorToFormState(author) {
	/** The front-end expects a language id rather than the language object. */
	const aliases = author.aliasSet ?
		author.aliasSet.aliases.map(({languageId, ...rest}) => ({
			...rest,
			language: languageId
		})) : [];

	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(author.aliasSet);
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
		author.disambiguation && author.disambiguation.comment;

	const identifiers = author.identifierSet ?
		author.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);

	const authorSection = {
		beginArea: entityRoutes.areaToOption(author.beginArea),
		beginDate: author.beginDate,
		endArea: entityRoutes.areaToOption(author.endArea),
		endDate: author.endDate,
		ended: author.ended,
		gender: author.gender && author.gender.id,
		type: author.authorType && author.authorType.id
	};

	const relationshipSection = {
		canEdit: true,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: {}
	};

	author.relationships.forEach((relationship) => (
		relationshipSection.relationships[relationship.id] = {
			relationshipType: relationship.type,
			rowID: relationship.id,
			sourceEntity: relationship.source,
			targetEntity: relationship.target
		}
	));

	const optionalSections = {};
	if (author.annotation) {
		optionalSections.annotationSection = author.annotation;
	}

	return {
		aliasEditor,
		authorSection,
		buttonBar,
		identifierEditor,
		nameSection,
		relationshipSection,
		...optionalSections
	};
}


router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadGenders, middleware.loadLanguages,
	middleware.loadAuthorTypes, middleware.loadEntityRelationships,
	middleware.loadRelationshipTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'author', req, res, {
				genderOptions: res.locals.genders
			}, authorToFormState
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
