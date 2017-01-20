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

import CreatorData from './creator-data';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import React from 'react';
import {createRootReducer} from './helpers';
import {createStore} from 'redux';
import creatorSectionReducer from './creator-section/reducer';

function createStoreWithDevTools(reducer, state) {
	if (typeof window === 'undefined' || !window.devToolsExtension) {
		return createStore(reducer, Immutable.fromJS(state));
	}
	return createStore(
		reducer, Immutable.fromJS(state), window.devToolsExtension()
	);
}

const RootComponent = ({
	initialState,
	...rest
}) => {
	const rootReducer =
		createRootReducer('creatorSection', creatorSectionReducer);
	const store = createStoreWithDevTools(rootReducer, initialState);

	return (
		<Provider store={store}>
			<CreatorData {...rest}/>
		</Provider>
	);
};
RootComponent.displayName = 'RootComponent';
RootComponent.propTypes = {
	initialState: React.PropTypes.object
};

export default RootComponent;
