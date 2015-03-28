var express = require('express');
var router = express.Router();
var auth = rootRequire('helpers/auth');
var Promise = require('bluebird');
var Edition = rootRequire('data/entities/edition');
var EditionStatus = rootRequire('data/properties/edition-status');
var Language = rootRequire('data/properties/language');

// Creation

router.get('/create', auth.isAuthenticated, function(req, res) {
	var editionStatusPromise = EditionStatus.find();
	var languagesPromise = Language.find();

	Promise.join(editionStatusPromise, languagesPromise,
		function(editionStatuses, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return a.frequency < b.frequency;

				return a.name.localeCompare(b.name);
			});

			console.log(editionStatuses);

			res.render('entity/create/edition', {
				languages: alphabeticLanguagesList,
				editionStatuses: editionStatuses
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		ended: req.body.ended
	};

	console.log(req.body);

	if (req.body.editionStatusId) {
		changes.edition_status = {
			edition_status_id: req.body.editionStatusId
		};
	}

	if (req.body.languageId) {
		changes.language = {
			language_id: req.body.languageId
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

	Edition.create(changes, {
			session: req.session
		})
		.then(function(revision) {
			res.send(revision);
		});
});

// Viewing

router.get('/:id', function(req, res, next) {
	var render = function(edition) {
		res.render('entity/view/edition', {
			title: 'BookBrainz',
			entity: edition
		});
	};

	Edition.findOne(req.params.id, {
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
