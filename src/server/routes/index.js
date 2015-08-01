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

var express = require('express');
var router = express.Router();
var _ = require('underscore');
var Revision = require('../data/properties/revision');
var bbws = require('../helpers/bbws');
var Promise = require('bluebird');
var Publication = require('../data/entities/publication');
var Creator = require('../data/entities/creator');
var Edition = require('../data/entities/edition');
var Work = require('../data/entities/work');
var Publisher = require('../data/entities/publisher');

/* GET home page. */
router.get('/', function(req, res) {
	var render = function(revisions) {
		res.render('index', {
			recent: revisions,
			homepage: true
		});
	};

	Revision.find({
			params: {
				limit: 9,
				type: 'entity'
			},
			populate: ['entity']
		})
		.then(render)
		.catch(function(err) {
			console.log(err.stack);
			render(null);
		});
});

router.get('/about', function(req, res) {
	res.render('about', {
		title: 'About'
	});
});

router.get('/contribute', function(req, res) {
	res.render('contribute', {
		title: 'Contribute'
	});
});

router.get('/develop', function(req, res) {
	res.render('develop', {
		title: 'Develop'
	});
});

router.get('/privacy', function(req, res) {
	res.render('privacy', {
		title: 'Privacy'
	});
});

router.get('/licensing', function(req, res) {
	res.render('licensing', {
		title: 'Licensing'
	});
});

router.get('/search', function(req, res) {
	var query = req.query.q;
	var mode = req.query.mode || 'search';

	var params = {
		q: query,
		mode: mode
	};

	if (req.query.collection) {
		params.collection = req.query.collection;
	}

	bbws.get('/search', {
			params: params
		})
		.then(function(results) {
			if (!results.hits) {
				return null;
			}

			return Promise.map(results.hits, function(hit) {
				var entity_stub = hit._source;
				var model;

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
				}

				if (model) {
					return model.findOne(entity_stub.entity_gid, {
						populate: ['disambiguation']
					});
				}
				else {
					return null;
				}
			});
		})
		.then(function(entities) {
			if (mode === 'search') {
				res.render('search', {
					title: 'Search Results',
					query: query,
					results: entities,
					hideSearch: true
				});
			}
			else if (mode === 'auto') {
				res.json(entities);
			}
		})
		.catch(function() {
			var message = 'An error occurred while obtaining search results';

			if (mode === 'search') {
				res.render('search', {
					title: 'Search Results',
					error: message,
					results: [],
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
