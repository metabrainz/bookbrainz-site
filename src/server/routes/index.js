/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
 *               2015       Leo Verto
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

import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from '../helpers/props';
import AboutPage from '../../client/components/pages/about';
import ContributePage from '../../client/components/pages/contribute';
import DevelopPage from '../../client/components/pages/develop';
import FAQPage from '../../client/components/pages/faq';
import HelpPage from '../../client/components/pages/help';
import Index from '../../client/components/pages/index';
import Layout from '../../client/containers/layout';
import LicensingPage from '../../client/components/pages/licensing';
import PrivacyPage from '../../client/components/pages/privacy';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import {getOrderedRevisions} from '../helpers/revisions';
import target from '../templates/target';


const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
	const {orm} = req.app.locals;
	const numRevisionsOnHomepage = 9;

	function render(recent) {
		const props = generateProps(req, res, {
			disableSignUp: req.signUpDisabled,
			homepage: true,
			isLoggedIn: Boolean(req.user),
			recent,
			requireJS: Boolean(res.locals.user)
		});

		/*
		 * Renders react components server side and injects markup into target
		 * file object spread injects the app.locals variables into React as
		 * props
		 */
		const markup = ReactDOMServer.renderToString(
			<Layout	{...propHelpers.extractLayoutProps(props)}>
				<Index {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);

		res.send(target({
			markup,
			page: 'Index',
			props: escapeProps(props),
			script: '/js/index.js'
		}));
	}


	try {
		const orderedRevisions = await getOrderedRevisions(0, numRevisionsOnHomepage, orm);
		return render(orderedRevisions);
	}
	catch (err) {
		return next(err);
	}
});

// Helper function to create pages that don't require custom logic
function _createStaticRoute(route, title, PageComponent) {
	router.get(route, (req, res) => {
		const props = generateProps(req, res);

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<PageComponent/>
			</Layout>
		);

		res.send(target({
			markup,
			page: title,
			props: escapeProps(props),
			script: '/js/index.js',
			title
		}));
	});
}

_createStaticRoute('/about', 'About', AboutPage);
_createStaticRoute('/contribute', 'Contribute', ContributePage);
_createStaticRoute('/develop', 'Develop', DevelopPage);
_createStaticRoute('/help', 'Help', HelpPage);
_createStaticRoute('/licensing', 'Licensing', LicensingPage);
_createStaticRoute('/privacy', 'Privacy', PrivacyPage);
_createStaticRoute('/faq', 'FAQs', FAQPage);

export default router;
