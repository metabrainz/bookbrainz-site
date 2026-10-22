import {extractLayoutProps, extractPreviewProps} from '../helpers/props';
import Layout from '../containers/layout';
import Preview from '../components/forms/preview';
import React from 'react';
import ReactDOM from 'react-dom';


const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const markup = (
	<Layout {...extractLayoutProps(props)}>
		<Preview {...extractPreviewProps(props)}/>
	</Layout>
);

ReactDOM.hydrate(markup, document.getElementById('target'));
