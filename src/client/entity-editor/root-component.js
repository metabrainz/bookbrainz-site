/*
 * Copyright (C) 2016  Ben Ockmore
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

 /* TODO: Drop this component, and follow
  * http://redux.js.org/docs/recipes/ServerRendering.html instead once server
  * code is using modules, which will happen ASAP after the PR for this code
  * is closed.
  */

import {applyMiddleware, compose, createStore} from 'redux';
import CreatorData from './creator-data';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import React from 'react';
import createDebounce from 'redux-debounce';
import {createRootReducer} from './helpers';
import creatorSectionReducer from './creator-section/reducer';

const KEYSTROKE_DEBOUNCE_TIME = 250;

function shouldDevToolsBeInjected() {
	return (
		typeof window === 'object' &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	);
}

/**
 * Root component. Wraps the entity data component in a react-redux store
 * provider component, allowing the store to be implicitly available to all
 * descendent elements.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.initialState - The initial state passed to the
 *        createStore function to initialize the Redux store.
 * @returns {ReactElement} React element containing the rendered RootComponent.
 */
const RootComponent = ({
	initialState,
	...rest
}) => {
	const rootReducer =
		createRootReducer('creatorSection', creatorSectionReducer);
	const debouncer = createDebounce({
		keystroke: KEYSTROKE_DEBOUNCE_TIME
	});
	const composeEnhancers = shouldDevToolsBeInjected() ?
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
	const store = createStore(
		rootReducer, Immutable.fromJS(initialState),
		composeEnhancers(applyMiddleware(debouncer))
	);

	return (
		<Provider store={store}>
			<CreatorData {...rest}/>
		</Provider>
	);
};
RootComponent.displayName = 'RootComponent';
RootComponent.propTypes = {
	initialState: React.PropTypes.object.isRequired
};

export default RootComponent;
