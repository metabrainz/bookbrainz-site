/*
 * Copyright (C) 2021  Akash Gupta
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
const additionalSeriesProps = [
	'entityType', 'orderingTypeId'
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
		disambiguation: data.nameSection.disambiguation,
		entityType: data.seriesSection.seriesType,
		identifiers,
		note: data.submissionSection.note,
		orderingTypeId: data.seriesSection.orderType,
		relationships
	};
}

const createOrEditHandler = makeEntityCreateOrEditHandler(
	'series', transformNewForm, additionalSeriesProps
);

/** ****************************
*********** Routes ************
*******************************/

const router = express.Router();

// Creation
router.get(
	'/create', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadLanguages,
	middleware.loadRelationshipTypes, middleware.loadSeriesOrderingTypes, (req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'series', req, res, {}
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
		'Series',
		[
			'defaultAlias',
			'disambiguation',
			'seriesOrderingType',
			'identifierSet.identifiers.type'
		],
		'Series not found'
	)
);

function _setSeriesTitle(res) {
	res.locals.title = utils.createEntityPageTitle(
		res.locals.entity,
		'Series',
		utils.template`Series “${'name'}”`
	);
}

router.get('/:bbid', middleware.loadEntityRelationships, middleware.loadEntities, (req, res) => {
	_setSeriesTitle(res);
	entityRoutes.displayEntity(req, res);
});


function seriesToFormState(series) {
	const aliases = series.aliasSet ?
		series.aliasSet.aliases.map(({languageId, ...rest}) => ({
			...rest,
			language: languageId
		})) : [];

	const defaultAliasIndex = entityRoutes.getDefaultAliasIndex(series.aliasSet);
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
		series.disambiguation && series.disambiguation.comment;

	const identifiers = series.identifierSet ?
		series.identifierSet.identifiers.map(({type, ...rest}) => ({
			type: type.id,
			...rest
		})) : [];

	const identifierEditor = {};
	identifiers.forEach(
		(identifier) => { identifierEditor[identifier.id] = identifier; }
	);
	const seriesSection = {
		orderType: series.seriesOrderingType && series.seriesOrderingType.id,
		seriesType: series.entityType
	};

	const relationshipSection = {
		canEdit: true,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: {}
	};
	series.relationships.forEach((relationship) => {
		relationship.attributeSet.relationshipAttributes.forEach(attribute => {
			relationship[`${attribute.type.name}`] = attribute.value.textValue;
		});
	});

	if (series.seriesOrderingType.label === 'Manual') {
		// eslint-disable-next-line no-nested-ternary
		series.relationships.sort((a, b) => (a.position > b.position ? 1 : b.position > a.position ? -1 : 0));
	}
	series.relationships.forEach((relationship) => (
		relationshipSection.relationships[`n${relationship.id}`] = {
			attribute: relationship.attributeSet ? relationship.attributeSet.relationshipAttributes : [],
			attributeSetId: relationship.attributeSetId,
			relationshipType: relationship.type,
			rowID: `n${relationship.id}`,
			sourceEntity: relationship.source,
			targetEntity: relationship.target
		}
	));

	const optionalSections = {};
	if (series.annotation) {
		optionalSections.annotationSection = series.annotation;
	}

	return {
		aliasEditor,
		buttonBar,
		identifierEditor,
		nameSection,
		relationshipSection,
		seriesSection,
		...optionalSections
	};
}

router.get(
	'/:bbid/edit', auth.isAuthenticated, middleware.loadIdentifierTypes,
	middleware.loadSeriesOrderingTypes, middleware.loadLanguages,
	 middleware.loadEntityRelationships, middleware.loadRelationshipTypes,
	(req, res) => {
		const {markup, props} = entityEditorMarkup(generateEntityProps(
			'series', req, res, {}, seriesToFormState
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

export default router;
