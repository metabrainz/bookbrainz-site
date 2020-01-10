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
import * as utils from '../helpers/utils';

import {escapeProps, generateProps} from '../helpers/props';

import AboutPage from '../../client/components/pages/about';
import ContributePage from '../../client/components/pages/contribute';
import DevelopPage from '../../client/components/pages/develop';
import HelpPage from '../../client/components/pages/help';
import Layout from '../../client/containers/layout';
import LicensingPage from '../../client/components/pages/licensing';
import PrivacyPage from '../../client/components/pages/privacy';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RevisionsListPage from '../../client/components/pages/revisionsListPage';
import _, {_snakeCase} from 'lodash';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
	const {orm} = req.app.locals;
	let size = req.query.size ? parseInt(req.query.size, 10) : 20;
	let from = req.query.from ? parseInt(req.query.from, 10) : 0;

	function render(entities) {
		const props = generateProps(req, res, {
			from,
			homepage: true,
			recent: _.take(entities, size),
			requireJS: Boolean(res.locals.user),
			size
		});

		/*
		 * Renders react components server side and injects markup into target
		 * file object spread injects the app.locals variables into React as
		 * props
		 */
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<RevisionsListPage
					// disableSignUp={req.signUpDisabled}
					from={props.from}
					results={props.recent}
					size={props.size}
				/>
			</Layout>
		);

		res.send(target({
			dev: process.env.NODE_ENV === 'development',
			markup,
			props: escapeProps(props),
			script: '/js/revisionsListPage.js',
			title: 'Revisions Page'
		}));
	}

	const entityModels = utils.getEntityModels(orm);

	try {
		let orderedEntities = await utils.getOrderedEntities(from, size, entityModels, orm);
		return render(orderedEntities);
	} catch (err) {
		return next(err);
	}
});


router.get('/revisions', async (req, res, next) => {
	const {orm} = req.app.locals;
	let size = req.query.size ? parseInt(req.query.size, 10) : 20;
	let from = req.query.from ? parseInt(req.query.from, 10) : 0;

	function render(entities) {
		const props = generateProps(req, res, {
			from,
			homepage: true,
			recent: _.take(entities, size),
			requireJS: Boolean(res.locals.user),
			size
		});
		res.send(props.recent);
	}

	const entityModels = utils.getEntityModels(orm);

	try {
		let orderedEntities = await utils.getOrderedEntities(from, size, entityModels, orm);
		return render(orderedEntities);
	} catch (err) {
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
			props: escapeProps(props),
			title: 'Revisions Page'
		}));
	});
}

_createStaticRoute('/about', 'About', AboutPage);
_createStaticRoute('/contribute', 'Contribute', ContributePage);
_createStaticRoute('/develop', 'Develop', DevelopPage);
_createStaticRoute('/help', 'Help', HelpPage);
_createStaticRoute('/licensing', 'Licensing', LicensingPage);
_createStaticRoute('/privacy', 'Privacy', PrivacyPage);

export default router;
