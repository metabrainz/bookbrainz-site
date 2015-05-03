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
			recent: revisions ? _.pluck(revisions, 'entity') : null
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

router.get('/getStarted', function(req, res) {
	res.render('getStarted', {
		title: 'Get Started'
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
						populate: [ 'disambiguation' ]
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
					results: entities
				});
			}
			else if (mode === 'auto') {
				res.json(entities);
			}
		});
});

module.exports = router;
