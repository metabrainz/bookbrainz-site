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


const {getEntitySection, getValidator} = entityEditorHelpers;

type EntityAction = 'create' | 'edit';

/**
 * Returns a props object with reasonable defaults for entity creation/editing.
 * @param {string} entityType - entity type
 * @param {string} action - 'create' or 'edit'
 * @param {request} req - request object
 * @param {response} res - response object
 * @param {object} additionalProps - additional props
 * @returns {object} - props
 */
export function generateEntityProps(
	entityType: string, action: EntityAction,
	req: express.request, res: express.response,
	additionalProps: Object): Object {
	const entityName = _.capitalize(entityType);
	const props = Object.assign({
		entityType,
		heading: `${_.capitalize(action)} ${entityName}`,
		initialState: {},
		languageOptions: res.locals.languages,
		requiresJS: true,
		subheading: action === 'create' ?
			`Add a new ${entityName} to BookBrainz` :
			`Edit an existing ${entityName} on BookBrainz`
	}, additionalProps);

	return generateProps(req, res, props);
}

/**
 * Return markup for the entity editor.
 * @param {object} props - react props
 * @param {function} rootReducer - redux root reducer
 * @returns {string} - HTML string
 */
export function entityEditorMarkup(
	props: { initialState: Object,
			 entityType: string },
	rootReducer: Function) {
	const {initialState, ...rest} = props;
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
	props.initialState = store.getState();

	return markup;
}
