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
const Revision = require('../data/properties/revision');
const bbws = require('../helpers/bbws');
const Promise = require('bluebird');
const Publication = require('../data/entities/publication');
const Creator = require('../data/entities/creator');
const Edition = require('../data/entities/edition');
const Work = require('../data/entities/work');
const Publisher = require('../data/entities/publisher');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

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
const SearchPage = React.createFactory(
	require('../../client/components/pages/search.jsx')
);
/* GET home page. */
router.get('/', (req, res) => {
	function render(revisions) {
		res.render('index', {
			recent: revisions,
			homepage: true
		});
	}

	Revision.find({
		params: {
			limit: 9,
			type: 'entity'
		},
		populate: ['entity']
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
		markup: ReactDOMServer.renderToString(AboutPage())
	});
});

router.get('/contribute', (req, res) => {
	res.render('page', {
		title: 'Contribute',
		markup: ReactDOMServer.renderToString(ContributePage())
	});
});

router.get('/develop', (req, res) => {
	res.render('page', {
		title: 'Develop',
		markup: ReactDOMServer.renderToString(DevelopPage())
	});
});

router.get('/privacy', (req, res) => {
	res.render('page', {
		title: 'Privacy',
		markup: ReactDOMServer.renderToString(PrivacyPage())
	});
});

router.get('/licensing', (req, res) => {
	res.render('page', {
		title: 'Licensing',
		markup: ReactDOMServer.renderToString(LicensingPage())
	});
});

router.get('/search', (req, res) => {
	const query = req.query.q;
	const mode = req.query.mode || 'search';

	const params = {
		q: query,
		mode
	};

	if (req.query.collection) {
		params.collection = req.query.collection;
	}

	bbws.get('/search', {
		params
	})
		.then((results) => {
			if (!results.hits) {
				return null;
			}

			return Promise.map(results.hits, (hit) => {
				const entity_stub = hit._source;
				let model = null;

				switch (entity_stub._type) {
					case 'Publication':
						model = Publication;
						break;
					case 'Creator':
						model = Creator;
						break;
					case 'Edition':
						model = Edition;
						break;
					case 'Work':
						model = Work;
						break;
					case 'Publisher':
						model = Publisher;
						break;
					default:
						return null;
				}

				return model.findOne(entity_stub.entity_gid, {
					populate: ['disambiguation']
				});
			});
		})
		.then((entities) => {
			if (mode === 'search') {
				const props = {
					query,
					initialResults: entities
				};

				res.render('search', {
					props,
					markup: ReactDOMServer.renderToString(SearchPage(props)),
					hideSearch: true
				});
			}
			else if (mode === 'auto') {
				res.json(entities);
			}
		})
		.catch(() => {
			const message = 'An error occurred while obtaining search results';

			if (mode === 'search') {
				const props = {
					error: message,
					initialResults: []
				};
				res.render('search', {
					title: 'Search Results',
					props,
					markup: ReactDOMServer.renderToString(SearchPage(props)),
					hideSearch: true

				});
			}
			else if (mode === 'auto') {
				res.json({
					error: message
				});
			}
		});
});

module.exports = router;
