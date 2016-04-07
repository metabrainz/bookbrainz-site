/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Leo Verto
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

'use strict';

const express = require('express');
const router = express.Router();
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const utils = require('../helpers/utils');

const AboutPage = React.createFactory(
	require('../../client/components/pages/about.jsx')
);
const ContributePage = React.createFactory(
	require('../../client/components/pages/contribute.jsx')
);
const DevelopPage = React.createFactory(
	require('../../client/components/pages/develop.jsx')
);
const PrivacyPage = React.createFactory(
	require('../../client/components/pages/privacy.jsx')
);
const LicensingPage = React.createFactory(
	require('../../client/components/pages/licensing.jsx')
);

const Revision = require('bookbrainz-data').Revision;

/* GET home page. */
router.get('/', (req, res) => {
	const numRevisionsOnHomepage = 9;

	new Revision()
		.query('orderBy', 'created_at', 'desc')
		.query('limit', numRevisionsOnHomepage)
		.fetchAll()
		.then((collection) => collection.toJSON())
		.map((revision) => {
			const model = utils.getEntityModelByType(revision.type);

			return model.forge({revisionId: revision.id})
				.fetch({
					withRelated: ['defaultAlias', 'revision.revision']
				})
				.then((entity) => entity.toJSON());
		})
		.then((latestEntities) => {
			res.render('index', {
				recent: latestEntities,
				homepage: true
			});
		});
});

// Helper function to create pages that don't require custom logic
function _createStaticRoute(route, title, pageComponent) {
	router.get(route, (req, res) => {
		res.render('page', {
			title,
			markup: ReactDOMServer.renderToString(pageComponent())
		});
	});
}

_createStaticRoute('/about', 'About', AboutPage);
_createStaticRoute('/contribute', 'Contribute', ContributePage);
_createStaticRoute('/develop', 'Develop', DevelopPage);
_createStaticRoute('/licensing', 'Licensing', LicensingPage);
_createStaticRoute('/privacy', 'Privacy', PrivacyPage);

module.exports = router;
