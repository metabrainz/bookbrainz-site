/*
 * Copyright (C) 2015  Ben Ockmore
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

/*
 * Following convention at
 * http://redux.js.org/docs/recipes/ServerRendering.html
 */

import * as helpers from './helpers';
import {applyMiddleware, compose, createStore} from 'redux';
import {
	extractChildProps,
	extractLayoutProps
} from '../helpers/props';
import {AppContainer} from 'react-hot-loader';
import EntityEditor from './entity-editor';
import EntityMerge from './entity-merge';
import Immutable from 'immutable';
import Layout from '../containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import createDebounce from 'redux-debounce';


const {
	createRootReducer, getValidator, getEntitySection,
	getEntitySectionMerge, shouldDevToolsBeInjected
} = helpers;

const KEYSTROKE_DEBOUNCE_TIME = 250;

const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};
const {initialState, ...rest} = props;

const isMerge = Boolean(props.mergingEntities);
const rootReducer = createRootReducer(props.entityType, isMerge);
const debouncer = createDebounce({keystroke: KEYSTROKE_DEBOUNCE_TIME});
const composeEnhancers = shouldDevToolsBeInjected() ?
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const getEntityEditor = () => {
	let Editor;
	let EntitySection;
	if (isMerge) {
		EntitySection = getEntitySectionMerge(props.entityType);
		Editor = EntityMerge;
	}
	else {
		EntitySection = getEntitySection(props.entityType);
		Editor = EntityEditor;
	}
	return (
		<Editor
			validate={getValidator(props.entityType)}
			{...extractChildProps(rest)}
		>
			<EntitySection/>
		</Editor>
	);
};
const store = createStore(
	rootReducer,
	Immutable.fromJS(initialState),
	composeEnhancers(applyMiddleware(debouncer, ReduxThunk))
);

const markup = (
	<AppContainer>
		<Layout {...extractLayoutProps(rest)}>
			<Provider store={store}>
				{getEntityEditor()}
			</Provider>
		</Layout>
	</AppContainer>
);

ReactDOM.hydrate(markup, document.getElementById('target'));

/*
 * As we are not exporting a component,
 * we cannot use the react-hot-loader module wrapper,
 * but instead directly use webpack Hot Module Replacement API
 */

if (module.hot) {
	module.hot.accept();
}
