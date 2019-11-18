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
import Index from '../../client/components/pages/index';
import Layout from '../../client/containers/layout';
import LicensingPage from '../../client/components/pages/licensing';
import PrivacyPage from '../../client/components/pages/privacy';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
	const {orm} = req.app.locals;
	const numRevisionsOnHomepage = 9;

	function render(entities) {
		const props = generateProps(req, res, {
			homepage: true,
			recent: _.take(entities, numRevisionsOnHomepage),
			requireJS: Boolean(res.locals.user)
		});

		/*
		 * Renders react components server side and injects markup into target
		 * file object spread injects the app.locals variables into React as
		 * props
		 */
		const markup = ReactDOMServer.renderToString(
			<Layout
				{...propHelpers.extractLayoutProps(props)}
				disableSignUp={req.signUpDisabled}
			>
				<Index
					disableSignUp={req.signUpDisabled}
					recent={props.recent}
				/>
			</Layout>
		);

		res.send(target({
			dev: process.env.NODE_ENV === 'development',
			markup,
			page: 'Index',
			props: escapeProps(props),
			script: '/js/index.js'
		}));
	}

	const entityModels = utils.getEntityModels(orm);

	try {
		const queryPromises = [];

		// eslint-disable-next-line guard-for-in
		for (const modelName in entityModels) {
			const SQLViewName = _.snakeCase(modelName);
			// Hand-crafted artisanal SQL query to get parent revision's default alias for deleted entities
			queryPromises.push(
				orm.bookshelf.knex.raw(`
					SELECT
						entity.type,
						entity.data_id,
						alias.name AS default_alias_name,
						parent_alias.name AS parent_alias_name,
						revision.id AS revision_id,
						revision.created_at AS created_at
					FROM bookbrainz.${SQLViewName} AS entity
					JOIN bookbrainz.revision ON revision.id = entity.revision_id
					LEFT JOIN bookbrainz.alias ON alias.id = entity.default_alias_id
					LEFT JOIN bookbrainz.revision_parent ON revision_parent.child_id = entity.revision_id AND entity.default_alias_id IS NULL
					LEFT JOIN bookbrainz.${SQLViewName} AS parent ON parent.revision_id = revision_parent.parent_id AND entity.default_alias_id IS NULL
					LEFT JOIN bookbrainz.alias as parent_alias ON parent_alias.id = parent.default_alias_id AND entity.default_alias_id IS NULL
					WHERE entity.master = true
					ORDER BY revision.created_at DESC
					LIMIT ${numRevisionsOnHomepage};`)
			);
		}

		const entitiesCollections = await Promise.all(queryPromises).catch(error => next(error));
		const latestEntities = entitiesCollections.reduce(
			(accumulator, value) => accumulator.concat(value.rows.map(entity => {
				// Massage returned values to fit the format of entities in the ORM
				// Step 1: Use camelCase instead of snake_case
				const correctedEntity = _.mapKeys(entity, (val, key) => _.camelCase(key));
				// Step 2: Restructure aliases
				if (correctedEntity.defaultAliasName) {
					correctedEntity.defaultAlias = {name: correctedEntity.defaultAliasName};
					correctedEntity.defaultAliasName = null;
					delete correctedEntity.defaultAliasName;
				}
				if (correctedEntity.parentAliasName) {
					correctedEntity.parentAlias = {name: correctedEntity.parentAliasName};
					correctedEntity.parentAliasName = null;
					delete correctedEntity.parentAliasName;
				}
				return correctedEntity;
			})),
			[]
		);

		const orderedEntities = _.orderBy(
			latestEntities, 'createdAt',
			['desc']
		);
		return render(orderedEntities);
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

export default router;
