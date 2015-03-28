var express = require('express'),
    router = express.Router(),
    auth = rootRequire('helpers/auth'),
    Promise = require('bluebird'),
    Creator = rootRequire('data/entities/creator'),
    Gender = rootRequire('data/properties/gender'),
    CreatorType = rootRequire('data/properties/creator-type'),
    Language = rootRequire('data/properties/language');

router.get('/', auth.isAuthenticated, function(req, res) {
	var gendersPromise = Gender.find();
	var creatorTypesPromise = CreatorType.find();
	var languagesPromise = Language.find();

	Promise.join(gendersPromise, creatorTypesPromise, languagesPromise,
		function(genders, creatorTypes, languages) {
			var genderList = genders.sort(function(a, b) {
				return a.id > b.id;
			});

			var alphabeticLanguagesList = languages.sort(function(a, b) {
				return a.name.localeCompare(b.name);
			});

			res.render('entity/create/creator', {
				genders: genderList,
				languages: alphabeticLanguagesList,
				creatorTypes: creatorTypes
			});
		});
});


router.post('/handler', auth.isAuthenticated, function(req, res) {
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

	if (req.body.disambiguation)
		changes.disambiguation = req.body.disambiguation;

	if (req.body.annotation)
		changes.annotation = req.body.annotation;

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
