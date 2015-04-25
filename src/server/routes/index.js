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
	query = req.query.q;
	var resultsPromise = bbws.get('/search?q=' + query);

	var entitiesPromise = resultsPromise
		.then(function(results) {
			var entities = results.objects.map(function(entity_stub) {
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
					return model.findOne(entity_stub.entity_gid);
				}
			});

			return Promise.all(entities);
		});

	Promise.join(resultsPromise, entitiesPromise, function(results, entities) {
		entities.forEach(function(entity, i) {
			entity.type = results.objects[i]._type;
		});

		console.log(results);
		res.render('search', {
			title: 'Search Results',
			query: query,
			results: entities
		});
	});
});


module.exports = router;
