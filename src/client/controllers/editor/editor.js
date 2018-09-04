/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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
	extractEditorProps,
	extractLayoutProps
} from '../../helpers/props';
import {AppContainer} from 'react-hot-loader';
import EditorContainer from '../../containers/editor';
import Layout from '../../containers/layout';
import ProfileTab from '../../components/pages/parts/editor-profile';
import React from 'react';
import ReactDOM from 'react-dom';
import RevisionsTab from '../../components/pages/parts/editor-revisions';


const propsTarget = document.getElementById('props');
const props = propsTarget ? JSON.parse(propsTarget.innerHTML) : {};

const pageTarget = document.getElementById('page');
const page = pageTarget ? pageTarget.innerHTML : '';

let tab = null;

if (page === 'revisions') {
	tab = <RevisionsTab editor={props.editor}/>;
}
else {
	tab = (
		<ProfileTab
			user={props.user}
			{...extractChildProps(props)}
		/>
	);
}

const markup = (
	<AppContainer>
		<Layout {...extractLayoutProps(props)} >
			<EditorContainer
				{...extractEditorProps(props)}
			>
				{tab}
			</EditorContainer>
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
