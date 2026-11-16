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
import Index from '../../client/components/pages/index';
import Layout from '../../client/containers/layout';
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
			requiresJS: Boolean(res.locals.user)
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
			locale: res.locals.locale,
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

export default router;
