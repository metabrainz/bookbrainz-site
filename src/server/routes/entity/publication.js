var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Publication = require('../../data/entities/publication');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadPublicationTypes = require('../../helpers/middleware').loadPublicationTypes;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

/* If the route specifies a BBID, load the Publication for it. */
router.param('bbid', makeEntityLoader(Publication, 'Publication not found'));

router.get('/:bbid', loadEntityRelationships, function(req, res, next) {
	var publication = res.locals.entity;
	var title = 'Publication';

	if (publication.default_alias && publication.default_alias.name)
		title = 'Publication “' + publication.default_alias.name + '”';

	res.render('entity/view/publication', {
		title: title
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadLanguages, loadPublicationTypes, function(req, res) {
	res.render('entity/create/publication', {
		title: 'Add Publication'
	});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null,
		publication_type: {
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

module.exports = router;
