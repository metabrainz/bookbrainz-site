var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Publication = require('../../data/entities/publication');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/publication.jsx'));
// Creation

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
	var props = {
		languages: res.locals.languages,
		publicationTypes: res.locals.publicationTypes,
		submissionUrl: '/publication/create/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/publication', {
		title: 'Add Publication',
		heading: 'Create Publication',
		subheading: 'Add a new Publication to BookBrainz',
		props: props,
		markup: markup
	});
});

router.get('/:bbid/edit', auth.isAuthenticated, loadPublicationTypes, loadLanguages, function(req, res) {
	var publication = res.locals.entity;

	var props = {
		languages: res.locals.languages,
		publicationTypes: res.locals.publicationTypes,
		publication: publication,
		submissionUrl: '/publication/' + publication.bbid + '/edit/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/publication', {
		title: 'Edit Publication',
		heading: 'Edit Publication',
		subheading: 'Edit an existing Publication in BookBrainz',
		props: props,
		markup: markup
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

router.post('/:bbid/edit/handler', auth.isAuthenticated, function(req, res) {
	var publication = res.locals.entity;

	var changes = {
		bbid: publication.bbid
	};

	var publicationTypeId = req.body.publicationTypeId;
	if ((!publication.publication_type) ||
	    (publication.publication_type.publication_type_id !== publicationTypeId)) {
		changes.publication_type = {
			publication_type_id: publicationTypeId
		};
	}

	var disambiguation = req.body.disambiguation;
	if ((!publication.disambiguation) ||
	    (publication.disambiguation.comment !== disambiguation)) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	var annotation = req.body.annotation;
	if ((!publication.annotation) ||
			(publication.annotation.content !== annotation)) {
		changes.annotation = annotation ? annotation : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	var currentAliases = publication.aliases.map(function(alias) {
		var nextAlias = req.body.aliases[0];

		if (alias.id != nextAlias.id) {
			// Remove the alias
			return [alias.id, null];
		}
		else {
			// Modify the alias
			req.body.aliases.shift();
			return [nextAlias.id, {
				name: nextAlias.name,
				sort_name: nextAlias.sort_name,
				language_id: nextAlias.languageId,
				primary: alias.primary,
				default: alias.default
			}];
		}
	});

	var newAliases = req.body.aliases.map(function(alias) {
		// At this point, the only aliases should have null IDs, but check anyway.
		if (alias.id) {
			return null;
		}
		else {
			return [null, {
				name: alias.name,
				sort_name: alias.sort_name,
				language_id: alias.languageId,
				primary: false,
				default: false
			}];
		}
	});

	changes.aliases = currentAliases.concat(newAliases);
	if (changes.aliases.length !== 0 && changes.aliases[0][1]) {
		changes.aliases[0][1].default = true;
	}

	Publication.update(publication.bbid, changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
