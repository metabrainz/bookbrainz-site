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
	extractChildProps,
	extractEntityProps,
	extractLayoutProps
} from '../../helpers/props';

import {AppContainer} from 'react-hot-loader';
import EntityRevisions from '../../components/pages/entity-revisions';
import Layout from '../../containers/layout';
import React, {Suspense, lazy} from 'react';
import ReactDOM from 'react-dom';

// Lazy load entity components
const AuthorPage = lazy(() => import('../../components/pages/entities/author'));
const EditionPage = lazy(() => import('../../components/pages/entities/edition'));
const EditionGroupPage = lazy(() => import('../../components/pages/entities/edition-group'));
const PublisherPage = lazy(() => import('../../components/pages/entities/publisher'));
const SeriesPage = lazy(() => import('../../components/pages/entities/series'));
const WorkPage = lazy(() => import('../../components/pages/entities/work'));

const entityComponents = {
	author: AuthorPage,
	edition: EditionPage,
	editionGroup: EditionGroupPage,
	publisher: PublisherPage,
	series: SeriesPage,
	work: WorkPage
};

// Loading fallback component
const EntityLoadingFallback = () => (
	<div className="text-center p-4">
		<div className="spinner-border text-primary" role="status">
			<span className="sr-only">Loading entity...</span>
		</div>
		<p className="mt-2">Loading entity component...</p>
	</div>
);

const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const pageTarget = document.getElementById('page');
const page = pageTarget ? pageTarget.innerHTML : '';

const Child = entityComponents[page] || AuthorPage;

let markup;
if (page === 'revisions') {
	markup = (
		<AppContainer>
			<Layout {...extractLayoutProps(props)}>
				<EntityRevisions
					entity={props.entity}
					{...extractChildProps(props)}
				/>
			</Layout>
		</AppContainer>
	);
}
else {
	markup = (
		<AppContainer>
			<Layout {...extractLayoutProps(props)}>
				<Suspense fallback={<EntityLoadingFallback />}>
					<Child {...extractEntityProps(props)}/>
				</Suspense>
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
