var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    Revision = rootRequire('data/properties/revision');

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
		populate: [ 'entity' ]
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

module.exports = router;
