var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Publication = require('../../data/entities/publication');
var User = require('../../data/user');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/publication.jsx'));
// Creation

var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadPublicationTypes = require('../../helpers/middleware').loadPublicationTypes;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;
var loadIdentifierTypes = require('../../helpers/middleware').loadIdentifierTypes;

var bbws = require('../../helpers/bbws');
var Promise = require('bluebird');

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


router.get('/:bbid/revisions', function(req, res, next) {
	var publication = res.locals.entity;
	var title = 'Publication';

	if (publication.default_alias && publication.default_alias.name)
		title = 'Publication “' + publication.default_alias.name + '”';

	bbws.get('/publication/' + publication.bbid + '/revisions')
	.then(function(revisions) {

		var users = {};
		revisions.objects.forEach(function(revision) {
			if(!users[revision.user.user_id]) {
				users[revision.user.user_id] = User.findOne(revision.user.user_id);
			}
		})

		Promise.props(users).then(function(users) {
			res.render('entity/revisions', {
				title: title,
				revisions: revisions,
				users: users
			});
		})
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadIdentifierTypes, loadLanguages, loadPublicationTypes, function(req, res) {
	var props = {
		languages: res.locals.languages,
		publicationTypes: res.locals.publicationTypes,
		identifierTypes: res.locals.identifierTypes,
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

router.get('/:bbid/edit', auth.isAuthenticated, loadIdentifierTypes, loadPublicationTypes, loadLanguages, function(req, res) {
	var publication = res.locals.entity;

	var props = {
		languages: res.locals.languages,
		publicationTypes: res.locals.publicationTypes,
		publication: publication,
		identifierTypes: res.locals.identifierTypes,
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

	var newIdentifiers = req.body.identifiers.map(function(identifier) {
		return {
			value: identifier.value,
			identifier_type: {
				identifier_type_id: identifier.typeId,
			}
		};
	});

	if (newIdentifiers.length) {
		changes.identifiers = newIdentifiers;
	}

	var newAliases = req.body.aliases.map(function(alias) {
		return {
			name: alias.name,
			sort_name: alias.sortName,
			language_id: alias.languageId,
			primary: alias.primary,
			default: alias.dflt
		};
	});

	if (newAliases.length) {
		changes.aliases = newAliases;
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

	var currentIdentifiers = publication.identifiers.map(function(identifier) {
		var nextIdentifier = req.body.identifiers[0];

		if (identifier.id != nextIdentifier.id) {
			// Remove the alias
			return [identifier.id, null];
		}
		else {
			// Modify the alias
			req.body.identifiers.shift();
			return [nextIdentifier.id, {
				value: nextIdentifier.value,
				identifier_type: {
					identifier_type_id: nextIdentifier.typeId,
				}
			}];
		}
	});

	var newIdentifiers = req.body.identifiers.map(function(identifier) {
		// At this point, the only aliases should have null IDs, but check anyway.
		if (identifier.id) {
			return null;
		}
		else {
			return [null, {
				value: identifier.value,
				identifier_type: {
					identifier_type_id: identifier.typeId,
				}
			}];
		}
	});

	changes.identifiers = currentIdentifiers.concat(newIdentifiers);

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
				default: alias.dflt
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
				primary: alias.primary,
				default: alias.dflt
			}]
		}
	});

	changes.aliases = currentAliases.concat(newAliases);

	Publication.update(publication.bbid, changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
