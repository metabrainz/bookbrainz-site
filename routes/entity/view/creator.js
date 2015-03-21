var express = require('express');
var router = express.Router();
var Creator = rootRequire('data/entities/creator');

router.get('/creator/:id', function(req, res, next) {
	var render = function(creator) {
		res.render('entity/view/creator', {
			title: 'BookBrainz',
			entity: creator
		});
	};

	Creator.findOne(req.params.id, {
		populate: [ 'aliases' ]
	})
		.then(render)
		.catch(function(err) {
			console.log(err.stack);
			next(err);
		});
});

module.exports = router;
