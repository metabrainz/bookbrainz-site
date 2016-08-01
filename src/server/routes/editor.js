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

const AchievementType = require('bookbrainz-data').AchievementType;
const AchievementUnlock = require('bookbrainz-data').AchievementUnlock;
const Editor = require('bookbrainz-data').Editor;
const TitleUnlock = require('bookbrainz-data').TitleUnlock;

const auth = require('../helpers/auth');
const handler = require('../helpers/handler');

const NotFoundError = require('../helpers/error').NotFoundError;
const PermissionDeniedError = require('../helpers/error').PermissionDeniedError;

const ProfileForm = React.createFactory(
	require('../../client/components/forms/profile.jsx')
);

const AchievementForm = React.createFactory(
	require('../../client/components/forms/achievements.jsx')
);

const router = express.Router();

router.get('/edit', auth.isAuthenticated, (req, res, next) => {
	const editorJSONPromise = new Editor({id: parseInt(req.user.id, 10)})
		.fetch()
		.then((editor) => editor.toJSON());

	const titleJSONPromise = new TitleUnlock()
		.where({'editor_id': parseInt(req.user.id, 10)})
		.fetchAll({
			withRelated: ['title']
		})
		.then((unlock) => {
			let titleJSON;
			if (unlock !== null) {
				titleJSON = unlock.toJSON();
			}
			else {
				titleJSON = {};
			}
			return titleJSON;
		});

	Promise.join(editorJSONPromise, titleJSONPromise,
		(editorJSON, titleJSON) => {
			const markup =
				ReactDOMServer.renderToString(ProfileForm({
					editor: editorJSON,
					titles: titleJSON
				}));

			res.render('editor/edit', {
				props: {
					editor: editorJSON,
					titles: titleJSON
				},
				markup
			});
		}
	)
		.catch(next);
});

router.post('/edit/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const editorJSONPromise = new Promise((resolve) => {
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
		.then((editor) => {
			let editorTitleUnlock;
			if (req.body.title === 'NULL' || req.body.title === '') {
				editorTitleUnlock = editor.set('titleUnlockId', null);
			}
			else {
				editorTitleUnlock = editor.set('titleUnlockId', req.body.title);
			}
			return editorTitleUnlock.save();
		})
		.then((editor) =>
			editor.toJSON()
		);

	handler.sendPromiseResult(res, editorJSONPromise);
});

router.get('/:id', (req, res, next) => {
	const userId = parseInt(req.params.id, 10);

	const editorJSONPromise = new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender']
		})
		.then((editordata) => {
			let editorJSON = editordata.toJSON();

			if (!req.user || userId !== req.user.id) {
				editorJSON = _.omit(editorJSON, ['password', 'email']);
			}

			return editorJSON;
		})
		.then((editorJSON) => {
			let editorTitleJSON;
			if (editorJSON.titleUnlockId === null) {
				editorTitleJSON = Promise.resolve(editorJSON);
			}
			else {
				editorTitleJSON = new TitleUnlock({
					id: editorJSON.titleUnlockId
				})
					.fetch({
						withRelated: ['title']
					})
					.then((unlock) => {
						if (unlock !== null) {
							editorJSON.title =
								unlock.relations.title.attributes;
						}
						return editorJSON;
					});
			}
			return editorTitleJSON;
		})
		.catch(Editor.NotFoundError, () => {
			throw new NotFoundError('Editor not found');
		})
		.catch(next);

	const achievementJSONPromise = new AchievementUnlock()
		.where('editor_id', userId)
		.where('profile_rank', '<=', '3')
		.query((qb) => qb.limit(3))
		.orderBy('profile_rank', 'ASC')
		.fetchAll({
			withRelated: ['achievement']
		})
		.then((achievements) => {
			const achievementJSON = {
				length: achievements.length,
				model: achievements.toJSON()
			};
			return achievementJSON;
		});

	Promise.join(achievementJSONPromise, editorJSONPromise,
		(achievementJSON, editorJSON) =>
			res.render('editor/editor', {
				editor: editorJSON,
				achievement: achievementJSON
			})
	);
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
			const editorJSON = editor.toJSON();
			let editorTitleJSON;
			if (editorJSON.titleUnlockId === null) {
				editorTitleJSON = Promise.resolve(editorJSON);
			}
			else {
				editorTitleJSON = new TitleUnlock({
					id: editorJSON.titleUnlockId
				})
					.fetch({
						withRelated: ['title']
					})
					.then((unlock) => {
						if (unlock !== null) {
							editorJSON.title =
								unlock.relations.title.attributes;
						}
						return editorJSON;
					});
			}
			return editorTitleJSON;
		})
		.then((editorJSON) => {
			res.render('editor/revisions', {
				editor: editorJSON
			});
		})
		.catch(Editor.NotFoundError, () => {
			throw new NotFoundError('Editor not found');
		})
		.catch(next);
});

router.get('/:id/achievements', (req, res, next) => {
	const userId = parseInt(req.params.id, 10);
	const editorJSONPromise = new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender']
		})
		.then((editordata) => {
			let editorJSON = editordata.toJSON();

			if (!req.user || userId !== req.user.id) {
				editorJSON = _.omit(editorJSON, ['password', 'email']);
				editorJSON.authenticated = false;
			}
			else {
				editorJSON.authenticated = true;
			}

			return editorJSON;
		})
		.then((editorJSON) => {
			let editorTitleJSON;
			if (editorJSON.titleUnlockId === null) {
				editorTitleJSON = Promise.resolve(editorJSON);
			}
			else {
				editorTitleJSON = new TitleUnlock({
					id: editorJSON.titleUnlockId
				})
					.fetch({
						withRelated: ['title']
					})
					.then((unlock) => {
						if (unlock !== null) {
							editorJSON.title =
								unlock.relations.title.attributes;
						}
						return editorJSON;
					});
			}
			return editorTitleJSON;
		})
		.catch(Editor.NotFoundError, () => {
			throw new NotFoundError('Editor not found');
		})
		.catch(next);


	const achievementJSONPromise = new AchievementUnlock()
		.where('editor_id', userId)
		.fetchAll()
		.then((unlocks) =>
			unlocks.map('attributes.achievementId')
		)
		.then((unlocks) =>
			new AchievementType()
				.orderBy('id', 'ASC')
				.fetchAll()
				.then((achievements) => {
					const model = achievements.map((achievementType) => {
						const achievementJSON = achievementType.toJSON();
						if (unlocks.indexOf(achievementJSON.id) >= 0) {
							achievementJSON.unlocked = true;
						}
						else {
							achievementJSON.unlocked = false;
						}
						return achievementJSON;
					});
					const achievementsJSON = {
						model
					};
					return achievementsJSON;
				}
			)
		);

	Promise.join(achievementJSONPromise, editorJSONPromise,
		(achievementJSON, editorJSON) => {
			const markup =
				ReactDOMServer.renderToString(AchievementForm({
					editor: editorJSON,
					achievement: achievementJSON
				}));

			res.render('editor/achievements', {
				editor: editorJSON,
				markup
			});
		}
	);
});

function rankUpdate(editorId, bodyRank, rank) {
	return new AchievementUnlock({
		editorId,
		profileRank: rank
	})
		.fetch()
		.then((unlock) => {
			if (unlock !== null) {
				unlock.set('profileRank', null)
					.save();
			}
		})
		.then(() => {
			let updatePromise;
			if (bodyRank !== 'none') {
				updatePromise = new AchievementUnlock({
					achievementId: parseInt(bodyRank, 10),
					editorId: parseInt(editorId, 10)
				})
					.fetch({require: true})
					.then((unlock) =>
						unlock.set('profileRank', rank)
							.save()
					);
			}
			else {
				updatePromise = Promise.resolve(false);
			}
			return updatePromise;
		});
}

router.post('/:id/achievements/', auth.isAuthenticated, (req, res) => {
	const userId = parseInt(req.params.id, 10);
	const editorPromise = new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender']
		})
		.then((editordata) => {
			let editorJSON;

			if (!req.user || userId !== req.user.id) {
				editorJSON = Promise.reject(new Error('Not authenticated'));
			}
			else {
				editorJSON = Promise.resolve(editordata.toJSON());
			}
			return editorJSON;
		});

	const rankOnePromise = rankUpdate(req.params.id, req.body.rank1, 1);
	const rankTwoPromise = rankUpdate(req.params.id, req.body.rank2, 2);
	const rankThreePromise = rankUpdate(req.params.id, req.body.rank3, 3);


	const rankPromise =
		editorPromise.then(() =>
			Promise.all([
				rankOnePromise,
				rankTwoPromise,
				rankThreePromise
			]))
				.then((rankJSON) => {
					res.redirect(`/editor/${req.params.id}`);
					return rankJSON;
				});
	handler.sendPromiseResult(res, rankPromise);
});

module.exports = router;
