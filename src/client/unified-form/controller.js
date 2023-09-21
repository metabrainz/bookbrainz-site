import * as helpers from './helpers';
import {applyMiddleware, compose, createStore} from 'redux';
import {
	extractChildProps,
	extractLayoutProps
} from '../helpers/props';
import {AppContainer} from 'react-hot-loader';
import Immutable from 'immutable';
import Layout from '../containers/layout';
import {Provider} from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import ReduxThunk from 'redux-thunk';
import UnifiedForm from './unified-form';
import createDebounce from 'redux-debounce';
import {validateForm as validateEditionForm} from '../entity-editor/validators/edition';


const {
	createRootReducer, shouldDevToolsBeInjected
} = helpers;

const KEYSTROKE_DEBOUNCE_TIME = 250;

const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};
const {initialState, ...rest} = props;


const rootReducer = createRootReducer();
const debouncer = createDebounce({keystroke: KEYSTROKE_DEBOUNCE_TIME});
const composeEnhancers = shouldDevToolsBeInjected() ?
	window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

function getEntityEditor() {
	return <UnifiedForm validator={validateEditionForm} {...extractChildProps(rest)}/>;
}

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
