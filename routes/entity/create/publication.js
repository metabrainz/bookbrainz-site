var express = require('express'),
    router = express.Router(),
    auth = rootRequire('helpers/auth'),
    Promise = require('bluebird'),
    Publication = rootRequire('data/entities/publication'),
    PublicationType = rootRequire('data/properties/publication-type'),
    Language = rootRequire('data/properties/language');

/* create publication endpoint */
router.get('/publication/create', auth.isAuthenticated, function(req, res) {
	// Get the list of publication types
	var publicationTypesPromise = PublicationType.find();
	var languagesPromise = Language.find();

	Promise.join(publicationTypesPromise, languagesPromise,
		function(publicationTypes, languages) {
			var alphabeticLanguagesList = languages.sort(function(a, b) {
				return a.name.localeCompare(b.name);
			});

			res.render('entity/create/publication', {
				languages: alphabeticLanguagesList,
				publicationTypes: publicationTypes
			});
		});
});

router.post('/publication/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		'bbid': null,
		'publication_type': {
			publication_type_id: req.body.publicationTypeId
		}
	};

	changes.aliases = req.body.aliases.map(function(alias) {
		return {
			'name': alias.name,
			'sort_name': alias.sortName,
			'language_id': alias.languageId,
			'primary': alias.primary,
			'default': alias.dflt
		};
	});

	Publication.create(changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
