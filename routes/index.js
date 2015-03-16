var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

/* GET home page. */
router.get('/', function(req, res) {
	var ws = req.app.get('webservice');
	var entityPromise = request.get(ws + '/entity?limit=9').promise();

	var render = function(entitiesWithData) {
		res.render('index', {
			title: 'BookBrainz',
			recent: entitiesWithData
		});
	};

	entityPromise
		.then(function(entities) {
			var extraData = entities.body.objects.map(function(entity) {
				entity.data = request.get(entity.data_uri).promise();
				entity.aliases = request.get(entity.aliases_uri).promise();
				return Promise.props(entity);
			});

			return Promise.all(extraData);
		})
		.then(render)
		.catch(function() {
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

module.exports = router;
