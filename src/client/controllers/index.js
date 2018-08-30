/*
 * Copyright (C) 2016  Sean Burke
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
	extractLayoutProps
} from '../helpers/props';
import AboutPage from '../../client/components/pages/about';
import {AppContainer} from 'react-hot-loader';
import ContributePage from '../../client/components/pages/contribute';
import DevelopPage from '../../client/components/pages/develop';
import Index from '../components/pages/index';
import Layout from '../containers/layout';
import LicensingPage from '../../client/components/pages/licensing';
import PrivacyPage from '../../client/components/pages/privacy';
import React from 'react';
import ReactDOM from 'react-dom';


const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const pageTarget = document.getElementById('page');
const page = propsTarget ? pageTarget.innerHTML : '';

const pageMap = {
	About: AboutPage,
	Contribute: ContributePage,
	Develop: DevelopPage,
	Index,
	Licensing: LicensingPage,
	Privacy: PrivacyPage
};

const Child = pageMap[page] || Index;

const markup = (
	<AppContainer>
		<Layout {...extractLayoutProps(props)}>
			<Child {...extractChildProps(props)}/>
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
