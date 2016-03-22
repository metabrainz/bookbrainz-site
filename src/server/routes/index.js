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
const Promise = require('bluebird');
const React = require('react');
const auth = require('../helpers/auth');

const Publication = require('bookbrainz-data').Publication;
const Creator = require('bookbrainz-data').Creator;
const Edition = require('bookbrainz-data').Edition;
const Work = require('bookbrainz-data').Work;
const Publisher = require('bookbrainz-data').Publisher;

const _ = require('lodash');
const status = require('http-status');

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
	const numRevisionsOnHomepage = 9;

	function render(entities) {
		res.render('index', {
			recent: _.take(entities, numRevisionsOnHomepage),
			homepage: true
		});
	}

	const entityTypes = {Creator, Edition, Work, Publisher, Publication};

	const latestEntitiesPromise =
		Promise.all(_.map(entityTypes, (Model, name) =>
			Model.query((qb) => {
				qb
					.leftJoin(
						'bookbrainz.revision',
						`bookbrainz.${_.snakeCase(name)}.revision_id`,
						'bookbrainz.revision.id'
					)
					.orderBy('bookbrainz.revision.created_at', 'desc')
					.limit(numRevisionsOnHomepage);
			})
			.fetchAll({
				withRelated: ['defaultAlias', 'revision.revision']
			})
			.then((collection) => collection.toJSON())
		));

	latestEntitiesPromise.then((latestEntitiesByType) => {
		const latestEntities = _.orderBy(
			_.flatten(latestEntitiesByType), 'revision.revision.createdAt',
			['desc']
		);
		render(latestEntities);
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

		switch (entityStub.type) {
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

		return new Model({bbid: entityStub.bbid})
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
					'defaultAlias.name.search': {
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

const uuidRegex =
	/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/;

router.get('/autocomplete', (req, res) => {
	const query = req.query.q;
	const esClient = req.app.get('esClient');

	const validBBID = Boolean(uuidRegex.exec(query));
	let searchObject = null;
	if (validBBID) {
		searchObject = {
			ids: {
				values: [query]
			}
		};
	}
	else {
		searchObject = {
			match: {
				'defaultAlias.name.autocomplete': {
					query,
					minimum_should_match: '80%'
				}
			}
		};
	}

	const queryData = {
		index: 'bookbrainz',
		body: {
			query: searchObject
		}
	};

	if (req.query.collection) {
		queryData.type = req.query.collection;
	}
	console.log(JSON.stringify(queryData, null, 4));

	esClient.search(queryData)
		.then((searchResponse) => searchResponse.hits)
		.then((results) => fetchEntityModelsForESResults(results))
		.then((entities) => {
			res.json(entities);
		})
		.catch((err) => {
			console.log(err);
			const message = 'An error occurred while obtaining search results';

			res.json({
				error: message
			});
		});
});

const indexSettings = {
	settings: {
		analysis: {
			filter: {
				trigrams_filter: {
					type: 'ngram',
					min_gram: 1,
					max_gram: 3
				},
				edge_filter: {
					type: 'edge_ngram',
					min_gram: 1,
					max_gram: 20
				}
			},
			analyzer: {
				trigrams: {
					type: 'custom',
					tokenizer: 'standard',
					filter: [
						'asciifolding',
						'lowercase',
						'trigrams_filter'
					]
				},
				edge: {
					type: 'custom',
					tokenizer: 'standard',
					filter: [
						'asciifolding',
						'lowercase',
						'edge_filter'
					]
				}
			}
		}
	},
	mappings: {
		_default_: {
			properties: {
				defaultAlias: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
							fields: {
								search: {
									type: 'string',
									analyzer: 'trigrams'
								},
								autocomplete: {
									type: 'string',
									analyzer: 'edge'
								}
							}
						}
					}
				}
			}
		}
	}
};

router.get('/reindex', auth.isAuthenticated, (req, res) => {
	// TODO: This is hacky, and we should replace it once we switch to SOLR.
	const trustedUsers = ['Leftmost', 'LordSputnik'];

	const userName = req.session.passport && req.session.passport.user && req.session.passport.user.name;
	if (trustedUsers.indexOf(userName) === -1) {
		return res.sendStatus(status.UNAUTHORIZED);
	}

	const esClient = req.app.get('esClient');

	// First, drop index and recreate
	const indexPromise = esClient.indices.delete({index: 'bookbrainz'})
		.then(() => esClient.indices.create(
				{index: 'bookbrainz', body: indexSettings}
		));

	// Then, fill with data

	function indexEntity(model) {
		const body = model.toJSON();
		console.log(body);
		return esClient.index({
			index: 'bookbrainz',
			id: body.bbid,
			type: body.type,
			body
		});
	}

	const baseRelations = ['annotation', 'disambiguation', 'defaultAlias'];

	// Update the indexed entries for each entity type in turn
	const editionsPromise = indexPromise
		.then(() => new Edition().fetchAll({
			withRelated: baseRelations.concat([
				/*'releaseEvents',*/ 'publication', /*'publishers', 'languages',*/
				'editionFormat', 'editionStatus'
			])
		}))
		.then((collection) => Promise.all(collection.map(indexEntity)));

	const creatorsPromise = indexPromise
		.then(() => new Creator().fetchAll({
			withRelated: baseRelations.concat(['gender', 'creatorType'])
		}))
		.then((collection) => Promise.all(collection.map(indexEntity)));

	const worksPromise = indexPromise
		.then(() => new Work().fetchAll({
			withRelated: baseRelations.concat(['workType'])
		}))
		.then((collection) => Promise.all(collection.map(indexEntity)));

	const publishersPromise = indexPromise
		.then(() => new Publisher().fetchAll({
			withRelated: baseRelations.concat(['publisherType'])
		}))
		.then((collection) => Promise.all(collection.map(indexEntity)));

	const publicationsPromise = indexPromise
		.then(() => new Publication().fetchAll({
			withRelated: baseRelations.concat(['publicationType'])
		}))
		.then((collection) => Promise.all(collection.map(indexEntity)));

	const refreshPromise = Promise.join(
		editionsPromise, creatorsPromise, worksPromise, publishersPromise,
		publicationsPromise,
		() => esClient.indices.refresh({index: 'bookbrainz'})
	);

	refreshPromise
		.then(() => res.send({success: true}))
		.catch(() => res.send({success: false}));
});

module.exports = router;
