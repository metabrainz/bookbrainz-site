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
const bbws = require('../helpers/bbws');
const Promise = require('bluebird');
const React = require('react');

const EntityRevision = require('bookbrainz-data').EntityRevision;
const Publication = require('bookbrainz-data').Publication;
const Creator = require('bookbrainz-data').Creator;
const Edition = require('bookbrainz-data').Edition;
const Work = require('bookbrainz-data').Work;
const Publisher = require('bookbrainz-data').Publisher;

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

/* GET home page. */
router.get('/', (req, res) => {
	function render(revisions) {
		res.render('index', {
			recent: revisions.toJSON(),
			homepage: true
		});
	}

	const numRevisionsOnHomepage = 9;
	EntityRevision
		.query((qb) => {
			qb
				.orderBy('id', 'desc')
				.limit(numRevisionsOnHomepage);
		})
		.fetchAll({
			withRelated: ['revision', 'entity', 'entityData.defaultAlias']
		})
		.then(render)
		.catch((err) => {
			console.log(err.stack);
			render(null);
		});
});

router.get('/about', (req, res) => {
	res.render('page', {
		title: 'About',
		markup: React.renderToString(AboutPage())
	});
});

router.get('/contribute', (req, res) => {
	res.render('page', {
		title: 'Contribute',
		markup: React.renderToString(ContributePage())
	});
});

router.get('/develop', (req, res) => {
	res.render('page', {
		title: 'Develop',
		markup: React.renderToString(DevelopPage())
	});
});

router.get('/privacy', (req, res) => {
	res.render('page', {
		title: 'Privacy',
		markup: React.renderToString(PrivacyPage())
	});
});

router.get('/licensing', (req, res) => {
	res.render('page', {
		title: 'Licensing',
		markup: React.renderToString(LicensingPage())
	});
});

function fetchEntityModelsForESResults(results) {
	if (!results.hits) {
		return null;
	}

	return Promise.map(results.hits, (hit) => {
		const entityStub = hit._source;
		let Model = null;

		switch (entityStub._type) {
			case 'Publication':
				Model = Publication;
				break;
			case 'Creator':
				Model = Creator;
				break;
			case 'Edition':
				Model = Edition;
				break;
			case 'Work':
				Model = Work;
				break;
			case 'Publisher':
				Model = Publisher;
				break;
			default:
				return null;
		}

		return new Model({bbid: entityStub.entity_gid})
			.fetch({withRelated: ['defaultAlias']})
			.then((entity) => entity.toJSON());
	});
}

router.get('/search', (req, res) => {
	const query = req.query.q;
	const esClient = req.app.get('esClient');

	const queryData = {
		index: 'bookbrainz',
		body: {
			query: {
				match: {
					'default_alias.name.search': {
						query,
						minimum_should_match: '80%'
					}
				}
			}
		}
	};

	if (req.query.collection) {
		queryData.type = req.query.collection;
	}

	esClient.search(queryData)
		.then((searchResponse) => searchResponse.hits)
		.then((results) => fetchEntityModelsForESResults(results))
		.then((entities) => {
			res.render('search', {
				title: 'Search Results',
				query,
				results: entities,
				hideSearch: true
			});
		})
		.catch(() => {
			const message = 'An error occurred while obtaining search results';

			res.render('search', {
				title: 'Search Results',
				error: message,
				results: [],
				hideSearch: true
			});
		});
});

module.exports = router;
