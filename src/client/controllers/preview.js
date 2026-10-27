import {extractLayoutProps, extractPreviewProps} from '../helpers/props';
import Layout from '../containers/layout';
import Preview from '../components/forms/preview';
import React from 'react';
import {hydrateRoot} from 'react-dom/client';


const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const markup = (
	<Layout {...extractLayoutProps(props)}>
		<Preview {...extractPreviewProps(props)}/>
	</Layout>
);

hydrateRoot(document.getElementById('target'), markup);
