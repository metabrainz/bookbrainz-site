var express = require('express');
var router = express.Router();
var auth = require('../../helpers/auth');
var Publisher = require('../../data/entities/publisher');

/* Middleware loader functions. */
var makeEntityLoader = require('../../helpers/middleware').makeEntityLoader;

var React = require('react');
var EditForm = React.createFactory(require('../../../client/components/forms/publisher.jsx'));
// Creation

var loadLanguages = require('../../helpers/middleware').loadLanguages;
var loadPublisherTypes = require('../../helpers/middleware').loadPublisherTypes;
var loadEntityRelationships = require('../../helpers/middleware').loadEntityRelationships;

/* If the route specifies a BBID, load the Publisher for it. */
router.param('bbid', makeEntityLoader(Publisher, 'Publisher not found'));

router.get('/:bbid', loadEntityRelationships, function(req, res, next) {
	var publisher = res.locals.entity;
	var title = 'Publisher';

	if (publisher.default_alias && publisher.default_alias.name)
		title = 'Publisher “' + publisher.default_alias.name + '”';

	res.render('entity/view/publisher', {
		title: title
	});
});

// Creation

router.get('/create', auth.isAuthenticated, loadLanguages, loadPublisherTypes, function(req, res) {
	var props = {
		languages: res.locals.languages,
		publisherTypes: res.locals.publisherTypes,
		submissionUrl: '/publisher/create/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/publisher', {
		title: 'Add Publisher',
		heading: 'Create Publisher',
		subheading: 'Add a new Publisher to BookBrainz',
		props: props,
		markup: markup
	});
});

router.get('/:bbid/edit', auth.isAuthenticated, loadPublisherTypes, loadLanguages, function(req, res) {
	var publisher = res.locals.entity;

	var props = {
		languages: res.locals.languages,
		publisherTypes: res.locals.publisherTypes,
		publisher: publisher,
		submissionUrl: '/publisher/' + publisher.bbid + '/edit/handler'
	};

	var markup = React.renderToString(EditForm(props));

	res.render('entity/create/publisher', {
		title: 'Edit Publisher',
		heading: 'Edit Publisher',
		subheading: 'Edit an existing Publisher in BookBrainz',
		props: props,
		markup: markup
	});
});

router.post('/create/handler', auth.isAuthenticated, function(req, res) {
	var changes = {
		bbid: null
	};

	console.log(req.body);

	if (req.body.publisherTypeId) {
		changes.publisher_type = {
			publisher_type_id: req.body.publisherTypeId
		};
	}

	if (req.body.beginDate) {
		changes.begin_date = req.body.beginDate;
	}

	if (req.body.endDate) {
		changes.end_date = req.body.endDate;
		changes.ended = true; // Must have ended if there's an end date.
	}
	else if (req.body.ended) {
		changes.ended = req.body.ended;
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

router.post('/:bbid/edit/handler', auth.isAuthenticated, function(req, res) {
	var publisher = res.locals.entity;

	var changes = {
		bbid: publisher.bbid
	};

	var publisherTypeId = req.body.publisherTypeId;
	if ((!publisher.publisher_type) ||
	    (publisher.publisher_type.publisher_type_id !== publisherTypeId)) {
		changes.publisher_type = {
			publisher_type_id: publisherTypeId
		};
	}

	var beginDate = req.body.beginDate;
	if (publisher.begin_date !== beginDate) {
		changes.begin_date = beginDate ? beginDate : null;
	}

	var endDate = req.body.endDate;
	var ended = req.body.ended;
	if (publisher.end_date !== endDate) {
		changes.end_date = endDate ? endDate : null;
		changes.ended = endDate ? true : ended; // Must have ended if there's an end date.
	}

	var disambiguation = req.body.disambiguation;
	if ((!publisher.disambiguation) ||
	    (publisher.disambiguation.comment !== disambiguation)) {
		changes.disambiguation = disambiguation ? disambiguation : null;
	}

	var annotation = req.body.annotation;
	if ((!publisher.annotation) ||
			(publisher.annotation.content !== annotation)) {
		changes.annotation = annotation ? annotation : null;
	}

	if (req.body.note) {
		changes.revision = {
			note: req.body.note
		};
	}

	var currentAliases = publisher.aliases.map(function(alias) {
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

	Publisher.update(publisher.bbid, changes, {
		session: req.session
	})
		.then(function(revision) {
			res.send(revision);
		});
});

module.exports = router;
