var express = require('express');
var router = express.Router();
var auth = rootRequire('helpers/auth');
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');
var Creator = rootRequire('data/entities/creator');

router.get('/creator/create', auth.isAuthenticated, function(req, res) {
	// Get the list of publication types
	var ws = req.app.get('webservice');

	var gendersPromise = request.get(ws + '/gender').promise().then(function(genderResponse) {
		return genderResponse.body;
	});

	var creatorTypesPromise = request.get(ws + '/creatorType').promise().then(function(creatorTypesResponse) {
		return creatorTypesResponse.body;
	});

	var languagesPromise = request.get(ws + '/language').promise().then(function(languagesResponse) {
		return languagesResponse.body;
	});

	Promise.join(gendersPromise, creatorTypesPromise, languagesPromise,
		function(genders, creatorTypes, languages) {
			var genderList = genders.objects.sort(function(a, b) {
				return a.id > b.id;
			});

			var alphabeticLanguagesList = languages.objects.sort(function(a, b) {
				return a.name.localeCompare(b.name);
			});

			res.render('entity/create/creator', {
				genders: genderList,
				languages: alphabeticLanguagesList,
				creatorTypes: creatorTypes
			});
		});
});


router.post('/creator/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		'bbid': null,
		'ended': req.body.ended
	};

	if (req.body.creatorTypeId) {
		changes.creator_type = {
			creator_type_id: req.body.creatorTypeId
		};
	}

	if (req.body.genderId) {
		changes.gender = {
			gender_id: req.body.genderId
		};
	}

	if (req.body.beginDate) {
		changes.begin_date = req.body.beginDate;
	}

	if (req.body.endDate) {
		changes.end_date = req.body.endDate;
	}

	changes.aliases = req.body.aliases.map(function(alias) {
		return {
			'name': alias.name,
			'sort_name': alias.sortName,
			'language_id': alias.languageId,
			'primary': alias.primary,
			'default': alias.dflt
		};
	});

	Creator.create(changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
