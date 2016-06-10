/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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

const Promise = require('bluebird');

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const express = require('express');
const _ = require('lodash');

const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const Editor = require('bookbrainz-data').Editor;

const auth = require('../helpers/auth');
const handler = require('../helpers/handler');

const NotFoundError = require('../helpers/error').NotFoundError;
const PermissionDeniedError = require('../helpers/error').PermissionDeniedError;

const ProfileForm = React.createFactory(
	require('../../client/components/forms/profile.jsx')
);

const router = express.Router();

router.get('/edit', auth.isAuthenticated, (req, res, next) => {
	new Editor({id: parseInt(req.user.id, 10)})
		.fetch()
		.then((editor) => {
			const markup =
				ReactDOMServer.renderToString(ProfileForm(editor.toJSON()));

			res.render('editor/edit', {
				props: editor.toJSON(),
				markup
			});
		})
		.catch(next);
});

router.post('/edit/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const editPromise = new Promise((resolve) => {
		if (req.user && req.body.id === req.user.id) {
			resolve();
		}

		// Edit is for a user other than the current one
		throw new PermissionDeniedError(
			'You do not have permission to edit that user'
		);
	})
		.then(() =>
			// Fetch the current user from the database
			Editor.forge({id: parseInt(req.user.id, 10)})
				.fetch()
		)
		.then((editor) =>
			// Modify the user to match the updates from the form
			editor.set('bio', req.body.bio)
				.save()
		)
		.then((editor) => editor.toJSON());

	handler.sendPromiseResult(res, editPromise);
});

router.get('/:id', (req, res, next) => {
	const userId = parseInt(req.params.id, 10);

	new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender']
		})
		.then((editor) => {
			let editorJSON = editor.toJSON();

			if (!req.user || userId !== req.user.id) {
				editorJSON = _.omit(editorJSON, ['password', 'email']);
			}

			return editorJSON;
		})
		.then((editorJSON) => {
			new AchievementUnlock()
				.where({'editor_id': userId})
				.orderBy('unlocked_at', 'DESC')
				.fetchAll({
					withRelated: ['achievement']
				})
				.then((achievements) => {
					// never returns more than 3 achievements for profile
					const length = Math.min(achievements.length, 3);
					const achievementJSON = {
						length,
						model: []
					};
					for (let i = 0; i < length; i++) {
						achievementJSON.model[i] =
							achievements.models[i]
								.relations.achievement.toJSON();
						achievementJSON.model[i].unlockedAt =
							achievements.models[i].attributes.unlockedAt;
					}
					return achievementJSON;
				})
				.then((achievementJSON) => {
					res.render('editor/editor', {
						editor: editorJSON,
						achievement: achievementJSON
					});
				});
		})
		.catch(Editor.NotFoundError, () => {
			throw new NotFoundError('Editor not found');
		})
		.catch(next);
});

router.get('/:id/revisions', (req, res, next) => {
	new Editor({id: parseInt(req.params.id, 10)})
		.fetch({
			require: true,
			withRelated: {
				revisions(query) {
					query.orderBy('id');
				}
			}
		})
		.then((editor) => {
			res.render('editor/revisions', {
				editor: editor.toJSON()
			});
		})
		.catch(Editor.NotFoundError, () => {
			throw new NotFoundError('Editor not found');
		})
		.catch(next);
});

module.exports = router;
