import {AppContainer} from 'react-hot-loader';
import CreateMultipleWorks from '../components/pages/create-multiple-works';
import Layout from '../containers/layout';
import React from 'react';
import ReactDOM from 'react-dom';
import {extractLayoutProps} from '../helpers/props';


const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};
const markup = (
	<AppContainer>
		<Layout {...extractLayoutProps(props)}>
			<CreateMultipleWorks {...props}/>
		</Layout>
	</AppContainer>
);

ReactDOM.hydrate(markup, document.getElementById('target'));

