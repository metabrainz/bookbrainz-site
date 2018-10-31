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

import * as auth from '../helpers/auth';
import * as error from '../helpers/error';
import * as handler from '../helpers/handler';
import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from '../helpers/props';
import AchievementsTab from
	'../../client/components/pages/parts/editor-achievements';
import EditorContainer from '../../client/containers/editor';
import Layout from '../../client/containers/layout';
import ProfileForm from '../../client/components/forms/profile';
import ProfileTab from '../../client/components/pages/parts/editor-profile';
import Promise from 'bluebird';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RevisionsTab from '../../client/components/pages/parts/editor-revisions';
import _ from 'lodash';
import express from 'express';
import target from '../templates/target';


const router = express.Router();

router.get('/edit', auth.isAuthenticated, (req, res, next) => {
	const {Editor, Gender, TitleUnlock} = req.app.locals.orm;
	const editorJSONPromise = new Editor({id: parseInt(req.user.id, 10)})
		.fetch({
			withRelated: ['area', 'gender']
		})
		.then((editor) => editor.toJSON());
	const titleJSONPromise = new TitleUnlock()
		.where('editor_id', parseInt(req.user.id, 10))
		.fetchAll({
			withRelated: ['title']
		})
		.then((unlock) => {
			let titleJSON;
			if (unlock === null) {
				titleJSON = {};
			}
			else {
				titleJSON = unlock.toJSON();
			}
			return titleJSON;
		});
	const genderJSONPromise = new Gender()
		.fetchAll()
		.then((gender) => {
			if (gender) {
				return gender.toJSON();
			}
			return [];
		});

	Promise.join(
		editorJSONPromise, titleJSONPromise, genderJSONPromise,
		(editorJSON, titleJSON, genderJSON) => {
			const props = generateProps(req, res, {
				editor: editorJSON,
				genders: genderJSON,
				titles: titleJSON
			});
			const script = '/js/editor/edit.js';
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<ProfileForm
						editor={props.editor}
						genders={props.genders}
						titles={props.titles}
					/>
				</Layout>
			);
			res.send(target({
				markup,
				props: escapeProps(props),
				script
			}));
		}
	)
		.catch(next);
});

router.post('/edit/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const {Editor} = req.app.locals.orm;
	const editorJSONPromise = new Promise((resolve) => {
		if (req.user && req.body.id === req.user.id) {
			resolve();
		}

		// Edit is for a user other than the current one
		throw new error.PermissionDeniedError(
			'You do not have permission to edit that user', req
		);
	})
		.then(
			// Fetch the current user from the database
			() => Editor.forge({id: parseInt(req.user.id, 10)}).fetch()
		)
		.then(
			// Modify the user to match the updates from the form
			(editor) => editor.set('bio', req.body.bio)
				.set('areaId', req.body.areaId)
				.set('genderId', req.body.genderId)
				.set('birthDate', req.body.birthDate)
				.set('name', req.body.name)
				.save()
		)
		.then((editor) => {
			let editorTitleUnlock;
			if (req.body.title) {
				editorTitleUnlock = editor.set('titleUnlockId', req.body.title);
			}
			else {
				editorTitleUnlock = editor.set('titleUnlockId', null);
			}
			return editorTitleUnlock.save();
		})
		.then((editor) => editor.toJSON());

	handler.sendPromiseResult(res, editorJSONPromise);
});

function getEditorTitleJSON(editorJSON, TitleUnlock) {
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
}

function getIdEditorJSONPromise(userId, req) {
	const {Editor, TitleUnlock} = req.app.locals.orm;

	return new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender', 'area']
		})
		.then((editordata) => {
			let editorJSON = editordata.toJSON();

			if (!req.user || userId !== req.user.id) {
				editorJSON = _.omit(editorJSON, ['password', 'email']);
			}

			return editorJSON;
		})
		.then(_.partialRight(getEditorTitleJSON, TitleUnlock))
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		});
}

router.get('/:id', (req, res, next) => {
	const {AchievementUnlock} = req.app.locals.orm;
	const userId = parseInt(req.params.id, 10);

	const editorJSONPromise = getIdEditorJSONPromise(userId, req)
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


	Promise.join(
		achievementJSONPromise, editorJSONPromise,
		(achievementJSON, editorJSON) => {
			const props = generateProps(req, res, {
				achievement: achievementJSON,
				editor: editorJSON,
				tabActive: 0
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)} >
					<EditorContainer
						{...propHelpers.extractEditorProps(props)}
					>
						<ProfileTab
							user={props.user}
							{...propHelpers.extractChildProps(props)}
						/>
					</EditorContainer>
				</Layout>
			);
			res.send(target({
				markup,
				page: 'profile',
				props: escapeProps(props),
				script: '/js/editor/editor.js'
			}));
		}
	);
});

router.get('/:id/revisions', (req, res, next) => {
	const {Editor, TitleUnlock} = req.app.locals.orm;
	new Editor({id: parseInt(req.params.id, 10)})
		.fetch({
			require: true,
			withRelated: {
				revisions(query) {
					query.orderBy('id');
				}
			}
		})
		.then((editor) => getEditorTitleJSON(editor.toJSON(), TitleUnlock))
		.then((editorJSON) => {
			const props = generateProps(req, res, {
				editor: editorJSON,
				tabActive: 1
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<EditorContainer
						{...propHelpers.extractEditorProps(props)}
					>
						<RevisionsTab
							editor={props.editor}
						/>
					</EditorContainer>
				</Layout>
			);
			res.send(target({
				markup,
				page: 'revisions',
				props: escapeProps(props),
				script: '/js/editor/editor.js'
			}));
		})
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		})
		.catch(next);
});

function setAchievementUnlockedField(achievements, unlockIds) {
	const model = achievements.map((achievementType) => {
		const achievementJSON = achievementType.toJSON();
		if (unlockIds.indexOf(achievementJSON.id) >= 0) {
			achievementJSON.unlocked = true;
		}
		else {
			achievementJSON.unlocked = false;
		}
		return achievementJSON;
	});
	return {
		model
	};
}

router.get('/:id/achievements', (req, res, next) => {
	const {
		AchievementType, AchievementUnlock
	} = req.app.locals.orm;
	const userId = parseInt(req.params.id, 10);

	const editorJSONPromise = getIdEditorJSONPromise(userId, req)
		  .catch(next);

	const achievementJSONPromise = new AchievementUnlock()
		.where('editor_id', userId)
		.fetchAll()
		.then((unlocks) => unlocks.map('attributes.achievementId'))
		.then(
			(unlocks) => new AchievementType()
				.orderBy('id', 'ASC')
				.fetchAll()
				.then((achievements) => setAchievementUnlockedField(
					achievements, unlocks
				))
		);

	Promise.join(
		achievementJSONPromise, editorJSONPromise,
		(achievementJSON, editorJSON) => {
			const props = generateProps(req, res, {
				achievement: achievementJSON,
				editor: editorJSON,
				tabActive: 2
			});
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<EditorContainer
						{...propHelpers.extractEditorProps(props)}
					>
						<AchievementsTab
							achievement={props.achievement}
							editor={props.editor}
						/>
					</EditorContainer>
				</Layout>
			);
			const script = '/js/editor/achievement.js';
			res.send(target({
				markup,
				props: escapeProps(props),
				script
			}));
		}
	);
});

function rankUpdate(orm, editorId, bodyRank, rank) {
	const {AchievementUnlock} = orm;
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
			if (bodyRank === '') {
				updatePromise = Promise.resolve(false);
			}
			else {
				updatePromise = new AchievementUnlock({
					achievementId: parseInt(bodyRank, 10),
					editorId: parseInt(editorId, 10)
				})
					.fetch({require: true})
					.then((unlock) => unlock.set('profileRank', rank).save());
			}
			return updatePromise;
		});
}


router.post('/:id/achievements/', auth.isAuthenticated, (req, res) => {
	const {orm} = req.app.locals;
	const {Editor} = orm;
	const userId = parseInt(req.params.id, 10);
	const editorPromise = new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender', 'area']
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

	const rankOnePromise = rankUpdate(orm, req.params.id, req.body.rank1, 1);
	const rankTwoPromise = rankUpdate(orm, req.params.id, req.body.rank2, 2);
	const rankThreePromise = rankUpdate(orm, req.params.id, req.body.rank3, 3);


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

export default router;
