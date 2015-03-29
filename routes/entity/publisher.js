var express = require('express');
var router = express.Router();
var auth = rootRequire('helpers/auth');
var Promise = require('bluebird');
var Publisher = rootRequire('data/entities/publisher');
var PublisherType = rootRequire('data/properties/publisher-type');
var Language = rootRequire('data/properties/language');

// Creation

router.get('/create', auth.isAuthenticated, function(req, res) {
	var publisherTypePromise = PublisherType.find();
	var languagesPromise = Language.find();

	Promise.join(publisherTypePromise, languagesPromise,
		function(publisherTypes, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return a.frequency < b.frequency;

				return a.name.localeCompare(b.name);
			});

			console.log(publisherTypes);

			res.render('entity/create/publisher', {
				languages: alphabeticLanguagesList,
				publisherTypes: publisherTypes
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		ended: req.body.ended
	};

	console.log(req.body);

	if (req.body.publisherTypesId) {
		changes.publisher_type = {
			publisher_type_id: req.body.publisherTypesId
		};
	}

	if (req.body.beginDate) {
		changes.begin_date = req.body.beginDate;
	}

	if (req.body.endDate) {
		changes.end_date = req.body.endDate;
	}

	if (req.body.disambiguation)
		changes.disambiguation = req.body.disambiguation;

	if (req.body.annotation)
		changes.annotation = req.body.annotation;

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	if (req.body.aliases.length) {
		var default_alias = req.body.aliases[0];

		changes.aliases = [{
			name: default_alias.name,
			sort_name: default_alias.sortName,
			language_id: default_alias.languageId,
			primary: default_alias.primary,
			default: true
		}];
	}

	Publisher.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

// Viewing

router.get('/:id', function(req, res, next) {
	var render = function(publisher) {
		res.render('entity/view/publisher', {
			title: 'BookBrainz',
			entity: publisher
		});
	};

	Publisher.findOne(req.params.id, {
			populate: [
				'annotation',
				'disambiguation'
			]
		})
		.then(render)
		.catch(function(err) {
			console.log(err.stack);
			next(err);
		});
});

module.exports = router;
