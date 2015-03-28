var express = require('express'),
    router = express.Router(),
    auth = rootRequire('helpers/auth'),
    Promise = require('bluebird'),
    Publication = rootRequire('data/entities/publication'),
    PublicationType = rootRequire('data/properties/publication-type'),
    Language = rootRequire('data/properties/language');

// Creation

router.get('/create', auth.isAuthenticated, function(req, res) {
	// Get the list of publication types
	var publicationTypesPromise = PublicationType.find();
	var languagesPromise = Language.find();

	Promise.join(publicationTypesPromise, languagesPromise,
		function(publicationTypes, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				if (a.frequency != b.frequency)
					return a.frequency < b.frequency;

				return a.name.localeCompare(b.name);
			});

			res.render('entity/create/publication', {
				languages: alphabeticLanguagesList,
				publicationTypes: publicationTypes
			});
		});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		'bbid': null,
		'publication_type': {
			publication_type_id: req.body.publicationTypeId
		}
	};

	if (req.body.disambiguation)
		changes.disambiguation = req.body.disambiguation;

	if (req.body.annotation)
		changes.annotation = req.body.annotation;

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

	Publication.create(changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

// Viewing

router.get('/:id', function(req, res, next) {
	var render = function(publication) {
		res.render('entity/view/publication', {
			title: 'BookBrainz',
			entity: publication
		});
	};

	Publication.findOne(req.params.id, {
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
