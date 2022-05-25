import {extractLayoutProps, extractPreviewProps} from '../helpers/props';
import {AppContainer} from 'react-hot-loader';
import Layout from '../containers/layout';
import Preview from '../components/forms/preview';
import React from 'react';
import ReactDOM from 'react-dom';


const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const markup = (
	<AppContainer>
		<Layout {...extractLayoutProps(props)}>
			<Preview {...extractPreviewProps(props)}/>
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
