/*
 * Copyright (C) 2018 Shivam Tripathi
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

import {
	extractEntityProps,
	extractLayoutProps
} from '../../helpers/props';
import ImportCreatorPage from '../../components/pages/import-entities/creator';
import ImportEditionPage from '../../components/pages/entities/edition';
import ImportPublicationPage from
	'../../components/pages/import-entities/publication';
import ImportPublisherPage from
	'../../components/pages/import-entities/publisher';
import ImportWorkPage from '../../components/pages/import-entities/work';
import Layout from '../../containers/layout';
import React from 'react';
import ReactDOM from 'react-dom';


const entityComponents = {
	creator: ImportCreatorPage,
	edition: ImportEditionPage,
	publication: ImportPublicationPage,
	publisher: ImportPublisherPage,
	work: ImportWorkPage
};

const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const pageTarget = document.getElementById('page');
const page = pageTarget ? pageTarget.innerHTML : '';

const Child = entityComponents[page] || ImportCreatorPage;

const markup = (
	<Layout {...extractLayoutProps(props)}>
		<Child {...extractEntityProps(props)}/>
	</Layout>
);


ReactDOM.hydrate(markup, document.getElementById('target'));
