/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

'use strict';

var express = require('express');
var router = express.Router();
var React = require('react');
var auth = require('../helpers/auth');
var Promise = require('bluebird');
var _ = require('underscore');

var Editor = require('bookbrainz-data').Editor;

var NotFoundError = require('../helpers/error').NotFoundError;
var ProfileForm = React.createFactory(require('../../client/components/forms/profile.jsx'));

router.get('/edit', auth.isAuthenticated, function(req, res, next) {
	new Editor({id: parseInt(req.user.id, 10)})
	.fetch()
	.then(function(user) {
		var markup = React.renderToString(ProfileForm(user.toJSON()));

		res.render('editor/edit', {
			props: user.toJSON(),
			markup: markup
		});
	})
	.catch(function() {
		next(new Error('An internal error occurred while loading profile'));
	});
});

router.post('/edit/handler', auth.isAuthenticated, function(req, res) {
	/* Should handle errors in some fashion other than redirecting. */
	if (req.body.id !== req.user.id) {
		req.session.error = 'You do not have permission to edit that user';
		res.redirect(303, '/editor/edit');
	}

	new Editor({
		id: parseInt(req.body.id, 10), bio: req.body.bio, email:req.body.email
	})
	.save()
	.then(function(user) {
		res.send(user.toJSON());
	})
	.catch(function() {
		req.session.error = 'An internal error occurred while modifying profile';
		res.redirect(303, '/editor/edit');
	});
});

router.get('/:id', function(req, res, next) {
	var userId = parseInt(req.params.id, 10);

	new Editor({ id: userId })
		.fetch({
			require: true,
			withRelated: ['editorType', 'gender']
		})
		.then(function render(fetchedEditor) {
			var editorJSON = fetchedEditor.toJSON();

			if (!req.user || userId !== req.user.id) {
				editorJSON = _.omit(editorJSON, ['password', 'email']);
			}

			res.render('editor/editor', {
				editor: editorJSON
			});
		})
		.catch(Editor.NotFoundError, function ifError(err) {
			next(new NotFoundError('Editor not found'));
		})
		.catch(function ifError(err) {
			var internalError = new Error('An internal error occurred while fetching editor');
			internalError.stack = err.stack;

			next(internalError);
		});
});

router.get('/:id/revisions', function(req, res, next) {
	var userId = parseInt(req.params.id, 10);

	new Editor({ id: userId })
		.fetch({
			require: true,
			withRelated: {
				revisions(query) { query.orderBy('id'); }
			}
		})
		.then((editor) => {
			res.render('editor/revisions', {
				editor: editor.toJSON()
			});
		})
		.catch(Editor.NotFoundError, function(err) {
			console.log(err.stack);
			next(new NotFoundError('Editor not found'));
		})
		.catch(function(err) {
			console.log(err.stack);
			next(new Error('An internal error occurred while fetching revisions'));
		});
});

module.exports = router;
