/*
 * Copyright (C) 2017  Eshan Singh
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

// @flow

import * as Immutable from 'immutable';
import * as entityEditorHelpers from '../../client/entity-editor/helpers';
import * as entityRoutes from '../routes/entity/entity';
import * as error from '../../common/helpers/error';
import * as propHelpers from '../../client/helpers/props';
import * as utils from './utils';

import type {$Request, $Response} from 'express';
import EntityEditor from '../../client/entity-editor/entity-editor';
import EntityMerge from '../../client/entity-editor/entity-merge';
import Layout from '../../client/containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import {createStore} from 'redux';
import {generateProps} from './props';


const {createRootReducer, getEntitySection, getEntitySectionMerge, getValidator} = entityEditorHelpers;

type EntityAction = 'create' | 'edit';
type PassportRequest = $Request & {user: any, session: any};

/**
 * Callback to get the initial state
 * @callback initialStateCallback
 * @param {object} entity - entity
 */

/**
 * Returns a props object with reasonable defaults for entity creation/editing.
 * @param {string} entityType - entity type
 * @param {request} req - request object
 * @param {response} res - response object
 * @param {object} additionalProps - additional props
 * @param {initialStateCallback} initialStateCallback - callback
 * to get the initial state
 * @returns {object} - props
 */
export function generateEntityProps(
	entityType: string,
	req: $Request, res: $Response,
	additionalProps: any,
	initialStateCallback: (entity: ?any) => any =
	// eslint-disable-next-line no-unused-vars
	(entity) => new Object()
): any {
	const entityName = _.upperFirst(entityType);
	const {entity} = res.locals;
	const isEdit = Boolean(entity);

	const getFilteredIdentifierTypes = isEdit ?
		_.partialRight(utils.filterIdentifierTypesByEntity, entity) :
		_.partialRight(utils.filterIdentifierTypesByEntityType, entityName);
	const filteredIdentifierTypes = getFilteredIdentifierTypes(
		res.locals.identifierTypes
	);
	const entityNameForRoute = _.kebabCase(entityType);
	const submissionUrl = isEdit ?
		`/${entityNameForRoute}/${entity.bbid}/edit/handler` :
		`/${entityNameForRoute}/create/handler`;

	const action: EntityAction = isEdit ? 'edit' : 'create';

	const props = Object.assign({
		action,
		entityType,
		heading: isEdit ?
			`Edit ${entity.defaultAlias.name} (${entityName})` :
			`Add ${entityName}`,
		identifierTypes: filteredIdentifierTypes,
		initialState: initialStateCallback(entity),
		languageOptions: res.locals.languages,
		requiresJS: true,
		subheading: isEdit ?
			`Edit an existing ${entityName} on BookBrainz` :
			`Add a new ${entityName} to BookBrainz`,
		submissionUrl
	}, additionalProps);

	return generateProps(req, res, props);
}

/**
 * Callback to get the initial state
 * @callback initialStateCallback
 * @param {object} entity - entity
 */

/**
 * Returns a props object with reasonable defaults for entity creation/editing.
 * @param {request} req - request object
 * @param {response} res - response object
 * @param {object} additionalProps - additional props
 * @param {initialStateCallback} initialStateCallback - callback
 * to get the initial state
 * @returns {object} - props
 */
export function generateEntityMergeProps(
	req: $Request, res: $Response,
	additionalProps: any,
	initialStateCallback: (entity: ?any) => any =
	(entity) => new Object()
): Object {
	const {entityType, mergingEntities} = additionalProps;
	const entityName = _.startCase(entityType);
	const entity = mergingEntities[0];

	const getFilteredIdentifierTypes = _.partialRight(utils.filterIdentifierTypesByEntity, entity);
	const filteredIdentifierTypes = getFilteredIdentifierTypes(
		res.locals.identifierTypes
	);

	const submissionUrl = `/${_.kebabCase(entityType)}/${entity.bbid}/merge/handler`;

	const props = Object.assign({
		entityType,
		heading: `Merge ${mergingEntities.length} ${entityName}s`,
		identifierTypes: filteredIdentifierTypes,
		initialState: initialStateCallback(mergingEntities),
		languageOptions: res.locals.languages,
		requiresJS: true,
		subheading: `You are merging ${mergingEntities.length} existing ${entityName}s:`,
		submissionUrl
	}, additionalProps);

	return generateProps(req, res, props);
}

/**
 * Return markup for the entity editor.
 * This also modifies the props value with a new initialState!
 * @param {object} props - react props
 * @param {function} rootReducer - redux root reducer
 * @returns {object} - Updated props and HTML string with markup
 */
export function entityEditorMarkup(
	props: { initialState: any,
			 entityType: string }
) {
	const {initialState, ...rest} = props;
	const rootReducer = createRootReducer(props.entityType);
	const store = createStore(rootReducer, Immutable.fromJS(initialState));
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

	return {
		markup,
		props: Object.assign({}, props, {
			intitialState: store.getState()
		})
	};
}

/**
 * Return markup for the entity merging tool.
 * This also modifies the props value with a new initialState!
 * @param {object} props - react props
 * @param {function} rootReducer - redux root reducer
 * @returns {object} - Updated props and HTML string with markup
 */
export function entityMergeMarkup(
	props: { initialState: any,
			 entityType: string }
) {
	const {initialState, ...rest} = props;
	const rootReducer = createRootReducer(props.entityType);
	const store = createStore(rootReducer, Immutable.fromJS(initialState));
	const EntitySection = getEntitySectionMerge(props.entityType);
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(rest)}>
			<Provider store={store}>
				<EntityMerge
					validate={getValidator(props.entityType)}
					{...propHelpers.extractChildProps(rest)}
				>
					<EntitySection/>
				</EntityMerge>
			</Provider>
		</Layout>
	);

	return {
		markup,
		props: Object.assign({}, props, {
			intitialState: store.getState()
		})
	};
}


/**
 * Callback for any transformations to the request body
 * @callback transformCallback
 * @param {object} body - request body
 */

/**
 * Handler for create or edit actions
 * @callback transformCallback
 * @param {object} req - request object
 * @param {object} res - response object
 */

/**
 * Makes a middleware handler for create or edit actions on entities.
 * @param {string} entityType - entity type
 * @param {transformCallback} transformNewForm - callback for transformations
 * @param {(string|string[])} propertiesToPick - props from transformed
 * request body to pick.
 * @param {boolean} isMergeHandler - Wether the submission was from a /merge/handler route
 * @returns {createOrEditHandler} createOrEditHandler - middleware handler
 */
export function makeEntityCreateOrEditHandler(
	entityType: string,
	transformNewForm: Function,
	propertiesToPick: string | string[],
	isMergeHandler: boolean = false
) {
	const entityName = _.upperFirst(entityType);
	const validate = getValidator(entityType);

	return function createOrEditHandler(
		req: PassportRequest,
		res: $Response
	) {
		if (!validate(req.body)) {
			const err = new error.FormSubmissionError();
			error.sendErrorAsJSON(res, err);
		}
		const {mergeQueue} = req.session;
		const isMergeOperation = isMergeHandler && mergeQueue && _.size(mergeQueue.mergingEntities) >= 2;

		req.body = transformNewForm(req.body);

		return entityRoutes.handleCreateOrEditEntity(
			req, res, entityName, _.pick(req.body, propertiesToPick), isMergeOperation
		);
	};
}

/**
 * add an initial relationship to entity from another enitty
 * when one entity created from other.
 * @param {object} props - props related to new entity
 * @param {number} relationshipTypeId - relationshipId number for initaial relationship
 * @param {object} targetEntity - details about target entitiy like edition group, publisher and author
 * @param {number} relationshipIndex - initial relationship index number
 */

export function addInitialRelationship(props, relationshipTypeId, relationshipIndex, targetEntity) {
	// Prepend 'i' here to indicate initail relationship row identifier
	const rowId = `i${relationshipIndex || 0}`;
	const relationship = props.relationshipTypes.find(
		relationshipType => relationshipType.id === relationshipTypeId
	);
	const targetEntityDetail = {
		bbid: targetEntity.id,
		defaultAlias: {name: targetEntity.text},
		type: targetEntity.type
	};

	const sourceEntityDetail = {
		defaultAlias: {name: ''},
		type: _.upperFirst(props.entityType)
	};

	const initialRelationship = {
		label: relationship.linkPhrase,
		relationshipType: relationship,
		rowID: rowId,
		sourceEntity: targetEntity.type === 'EditionGroup' || targetEntity.type === 'Work' ? sourceEntityDetail : targetEntityDetail,
		targetEntity: targetEntity.type === 'EditionGroup' || targetEntity.type === 'Work' ? targetEntityDetail : sourceEntityDetail
	};

	if (!props.initialState.relationshipSection) {
		props.initialState.relationshipSection = {};
		props.initialState.relationshipSection.canEdit = true;
		props.initialState.relationshipSection.lastRelationships = null;
		props.initialState.relationshipSection.relationshipEditorProps = null;
		props.initialState.relationshipSection.relationshipEditorVisible = false;
	}
	props.initialState.relationshipSection.relationships =
		{...props.initialState.relationshipSection.relationships, [rowId]: initialRelationship};

	return props;
}
