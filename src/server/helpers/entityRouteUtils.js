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
	(entity) => new Object()): Object {
	const entityName = _.capitalize(entityType);
	const {entity} = res.locals;
	const isEdit = Boolean(entity);

	const getFilteredIdentifierTypes = isEdit ?
		_.partialRight(utils.filterIdentifierTypesByEntity, entity) :
		_.partialRight(utils.filterIdentifierTypesByEntityType, entityName);
	const filteredIdentifierTypes = getFilteredIdentifierTypes(
		res.locals.identifierTypes
	);

	const submissionUrl = isEdit ?
		`/${entityType}/${entity.bbid}/edit/handler` :
		`/${entityType}/create/handler`;

	const props = Object.assign({
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
			 entityType: string }) {
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
	additionalCallback?: (req: Object, res: Object) => any =
	(req, res) => null) {
	const entityName = _.capitalize(entityType);
	return function createOrEditHandler(
		action: EntityAction,
		req: express.request,
		res: express.response) {
		const validate = getValidator(entityType);
		if (!validate(req.body)) {
			const err = new error.FormSubmissionError();
			error.sendErrorAsJSON(res, err);
		}

		req.body = transformNewForm(req.body);

		const entityFunction = action === 'create' ?
			  entityRoutes.createEntity :
			  entityRoutes.editEntity;

		return entityFunction(
			req, res, entityName, _.pick(req.body, propertiesToPick),
			additionalCallback(req, res)
		);
	};
}
