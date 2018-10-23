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

import {
	extractEntityProps,
	extractLayoutProps
} from '../../helpers/props';
import {AppContainer} from 'react-hot-loader';
import CreatorPage from '../../components/pages/entities/creator';
import EditionPage from '../../components/pages/entities/edition';
import EntityRevisions from '../../components/pages/entity-revisions';
import Layout from '../../containers/layout';
import PublicationPage from '../../components/pages/entities/publication';
import PublisherPage from '../../components/pages/entities/publisher';
import React from 'react';
import ReactDOM from 'react-dom';
import WorkPage from '../../components/pages/entities/work';


const entityComponents = {
	creator: CreatorPage,
	edition: EditionPage,
	publication: PublicationPage,
	publisher: PublisherPage,
	work: WorkPage
};
const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const pageTarget = document.getElementById('page');
const page = pageTarget ? pageTarget.innerHTML : '';

const Child = entityComponents[page] || CreatorPage;

let markup = null;
if (page === 'revisions') {
	markup = (
		<AppContainer>
			<Layout {...extractLayoutProps(props)}>
				<EntityRevisions
					entity={props.entity}
					revisions={props.revisions}
				/>
			</Layout>
		</AppContainer>
	);
}
else {
	markup = (
		<AppContainer>
			<Layout {...extractLayoutProps(props)}>
				<Child {...extractEntityProps(props)}/>
			</Layout>
		</AppContainer>
	);
}

ReactDOM.hydrate(markup, document.getElementById('target'));

/*
 * As we are not exporting a component,
 * we cannot use the react-hot-loader module wrapper,
 * but instead directly use webpack Hot Module Replacement API
 */

if (module.hot) {
	module.hot.accept();
}
