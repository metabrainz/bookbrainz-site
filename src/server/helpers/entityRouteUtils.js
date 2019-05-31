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
import * as error from './error';
import * as propHelpers from '../../client/helpers/props';
import * as utils from './utils';

import EntityEditor from '../../client/entity-editor/entity-editor';
import Layout from '../../client/containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import {createStore} from 'redux';
import express from 'express';
import {generateProps} from './props';

const {createRootReducer, getEntitySection, getValidator} = entityEditorHelpers;

type EntityAction = 'create' | 'edit';

/**
 * Callback to get the initial state
 * @callback initialState
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
	req: express.request, res: express.response,
	additionalProps: Object,
	initialStateCallback: (entity: ?Object) => Object =
	(entity) => new Object()
): Object {
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
			`Edit ${entityName}` :
			`Create ${entityName}`,
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
 * Return markup for the entity editor.
 * This also modifies the props value with a new initialState!
 * @param {object} props - react props
 * @param {function} rootReducer - redux root reducer
 * @returns {object} - Updated props and HTML string with markup
 */
export function entityEditorMarkup(
	props: { initialState: Object,
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
 * Additional callback to pass data to the entity
 * create/edit function
 * @callback additionalCallback
 * @param {object} req - request object
 * @param {object} res - response object
 */

/**
 * Makes a middleware handler for create or edit actions on entities.
 * @param {string} entityType - entity type
 * @param {transformCallback} transformNewForm - callback for transformations
 * @param {(string|string[])} propertiesToPick - props from transformed
 * request body to pick.
 * @param {additionalCallback} additionalCallback - a callback that returns any
 * additional data for the entity creation/editing.
 * @returns {createOrEditHandler} createOrEditHandler - middleware handler
 */
export function makeEntityCreateOrEditHandler(
	entityType: string,
	transformNewForm: Function,
	propertiesToPick: string | string[],
) {
	const entityName = _.upperFirst(entityType);
	const validate = getValidator(entityType);

	return function createOrEditHandler(
		req: express.request,
		res: express.response
	) {
		if (!validate(req.body)) {
			const err = new error.FormSubmissionError();
			error.sendErrorAsJSON(res, err);
		}

		req.body = transformNewForm(req.body);

		return entityRoutes.handleCreateOrEditEntity(
			req, res, entityName, _.pick(req.body, propertiesToPick)
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
		props.initialState.relationshipSection.lastRelationships = null;
		props.initialState.relationshipSection.relationshipEditorProps = null;
		props.initialState.relationshipSection.relationshipEditorVisible = false;
	}
	props.initialState.relationshipSection.relationships =
		{...props.initialState.relationshipSection.relationships, [rowId]: initialRelationship};

	return props;
}

export function separateDateInObject(value: string) {
	const date = value ? value.split('-') : [];
	// A leading minus sign denotes a BC date
	// This creates an empty first array item that needs to be removed,
	// and requires us to add the negative sign back for the year
	if (date.length && date[0] === '') {
		date.shift();
		date[0] = -date[0];
	}
	return {
		day: date.length > 2 ? date[2] : '',
		month: date.length > 1 ? date[1] : '',
		year: date.length > 0 ? date[0] : ''
	};
}

export function dateObjectToString(value) {
	const isCommonEraDate = Math.sign(value.year) > -1;
	// Convert to ISO 8601:2004 extended for BCE years (±YYYYYY)
	let date = `${isCommonEraDate ? '+' : '-'}${_.padStart(Math.abs(value.year).toString(), 6, '0')}`;
	if (value.month) {
		date += `-${value.month}`;
		if (value.day) {
			date += `-${value.day}`;
	  }
	}
	return date;
}
