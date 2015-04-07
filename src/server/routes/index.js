var express = require('express');
var router = express.Router();
var _ = require('underscore');
var Revision = rootRequire('data/properties/revision');
var bbws = rootRequire('helpers/bbws');
var Promise = require('bluebird');
var Publication = rootRequire('data/entities/publication');
var Creator = rootRequire('data/entities/creator');
var Edition = rootRequire('data/entities/edition');
var Work = rootRequire('data/entities/work');
var Publisher = rootRequire('data/entities/publisher');

/* GET home page. */
router.get('/', function(req, res) {
	var render = function(revisions) {
		res.render('index', {
			title: 'BookBrainz',
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
		title: 'BookBrainz :: About',
	});
});

router.get('/contribute', function(req, res) {
	res.render('contribute', {
		title: 'BookBrainz :: Contribute',
	});
});

router.get('/develop', function(req, res) {
	res.render('develop', {
		title: 'BookBrainz :: Develop',
	});
});

router.get('/getStarted', function(req, res) {
	res.render('getStarted', {
		title: 'BookBrainz :: Get Started',
	});
});

router.get('/privacy', function(req, res) {
	res.render('privacy', {
		title: 'BookBrainz :: Privacy',
	});
});

router.get('/licensing', function(req, res) {
	res.render('licensing', {
		title: 'BookBrainz :: Licensing',
	});
});

router.get('/search', function(req, res) {
	query = req.query.q;
	var resultsPromise = bbws.get('/search?q=' + query);

	var entitiesPromise = resultsPromise
		.then(function(results) {
			var entities = results.objects.map(function(entity_stub) {
				if (entity_stub._type == 'Publication') {
					return Publication.findOne(entity_stub.entity_gid);
				} else if (entity_stub._type == 'Creator') {
					return Creator.findOne(entity_stub.entity_gid);
				} else if (entity_stub._type == 'Edition') {
					return Edition.findOne(entity_stub.entity_gid);
				} else if (entity_stub._type == 'Work') {
					return Work.findOne(entity_stub.entity_gid);
				} else if (entity_stub._type == 'Publisher') {
					return Publisher.findOne(entity_stub.entity_gid);
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
			title: 'BookBrainz :: Search "' + query + '"',
			query: query,
			results: entities
		});
	});
});


module.exports = router;
