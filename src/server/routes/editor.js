/*
 * Copyright (C) 2015, 2020  Ben Ockmore
 *               2015-2016   Sean Burke
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
import * as commonUtils from '../../common/helpers/utils';
import * as error from '../../common/helpers/error';
import * as handler from '../helpers/handler';
import * as propHelpers from '../../client/helpers/props';
import * as search from '../../common/helpers/search';
import * as utils from '../helpers/utils';
import {eachMonthOfInterval, format, isAfter, isValid} from 'date-fns';
import {escapeProps, generateProps} from '../helpers/props';
import AchievementsTab from '../../client/components/pages/parts/editor-achievements';
import CollectionsPage from '../../client/components/pages/collections';
import EditorContainer from '../../client/containers/editor';
import EditorRevisionPage from '../../client/components/pages/editor-revision';
import Layout from '../../client/containers/layout';
import ProfileForm from '../../client/components/forms/profile';
import ProfileTab from '../../client/components/pages/parts/editor-profile';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import express from 'express';
import {getOrderedCollectionsForEditorPage} from '../helpers/collections';
import {getOrderedRevisionForEditorPage} from '../helpers/revisions';
import target from '../templates/target';


const router = express.Router();

router.get('/edit', auth.isAuthenticated, async (req, res, next) => {
	const {Editor, Gender, TitleUnlock} = req.app.locals.orm;

	// Prepare three promises to be resolved in parallel to fetch the required
	// data.
	const editorModelPromise = new Editor({id: parseInt(req.user.id, 10)})
		.fetch({
			require: true,
			withRelated: ['area', 'gender']
		})
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		});

	const titleUnlockModelPromise = new TitleUnlock()
		.where('editor_id', parseInt(req.user.id, 10))
		.fetchAll({
			require: false,
			withRelated: ['title']
		});

	const gendersModelPromise = new Gender().fetchAll({require: false});

	// Parallel fetch the three required models. Only "editorModelPromise" has
	// "require: true", so only that can throw a NotFoundError, which is why the
	// other two model fetch operations have no error handling.
	const [editorModel, titleUnlockModel, genderModel] = await Promise.all([
		editorModelPromise, titleUnlockModelPromise, gendersModelPromise
	]).catch(next);

	// Convert the requested models to JSON structures.
	const editorJSON = editorModel.toJSON();
	const titleJSON =
		titleUnlockModel === null ? {} : titleUnlockModel.toJSON();
	const genderJSON = genderModel ? genderModel.toJSON() : [];

	// Populate the props to be passed to React with the fetched and formatted
	// information.
	const props = generateProps(req, res, {
		editor: editorJSON,
		genders: genderJSON,
		titles: titleJSON
	});

	// Render the DOM
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<ProfileForm
				editor={props.editor}
				genders={props.genders}
				titles={props.titles}
			/>
		</Layout>
	);

	// Send the rendered DOM, the props and the script to the client
	res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/editor/edit.js'
	}));
});

function isCurrentUser(reqUserID, sessionUser) {
	// No session user set, so cannot be true.
	if (!sessionUser) {
		return false;
	}

	// Return true if session user is set and matches the given ID.
	return reqUserID === sessionUser.id;
}

router.post('/edit/handler', auth.isAuthenticatedForHandler, (req, res) => {
	const {Editor} = req.app.locals.orm;
	const editorJSONPromise = new Promise((resolve) => {
		if (isCurrentUser(req.body.id, req.user)) {
			resolve();
		}

		// Edit is for a user other than the current one
		throw new error.PermissionDeniedError(
			'You do not have permission to edit that user', req
		);
	})
		.then(
			// Fetch the current user from the database
			() => Editor.forge({id: parseInt(req.user.id, 10)}).fetch({require: true})
		)
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		})
		.then(
			// Modify the user to match the updates from the form
			(editor) => editor.set('bio', req.body.bio)
				.set('areaId', req.body.areaId)
				.set('genderId', req.body.genderId)
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
		.then((editor) => {
			const editorJSON = editor.toJSON();
			const editorForES = {};
			editorForES.bbid = editorJSON.id;
			editorForES.aliasSet = {
				aliases: [
					{name: editorJSON.name}
				]
			};
			editorForES.type = 'Editor';
			return editorForES;
		});

	handler.sendPromiseResult(res, editorJSONPromise, search.indexEntity);
});

async function getEditorTitleJSON(editorJSON, TitleUnlock) {
	const unlockID = editorJSON.titleUnlockId;
	if (unlockID === null) {
		return editorJSON;
	}

	const titleUnlockModel = await new TitleUnlock({id: unlockID})
		.fetch({
			require: false,
			withRelated: ['title']
		});

	if (titleUnlockModel !== null) {
		editorJSON.title = titleUnlockModel.relations.title.attributes;
	}

	return editorJSON;
}

async function getIdEditorJSONPromise(userId, req) {
	const {Editor, TitleUnlock} = req.app.locals.orm;

	const editorData = await new Editor({id: userId})
		.fetch({
			require: true,
			withRelated: ['type', 'gender', 'area']
		})
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		});

	return getEditorTitleJSON(editorData.toJSON(), TitleUnlock);
}

export async function getEditorActivity(editorId, startDate, Revision, endDate = Date.now()) {
	if (!isValid(startDate)) {
		throw new Error('Start date is invalid');
	}
	if (!isValid(endDate)) {
		throw new Error('End date is invalid');
	}
	if (!isAfter(endDate, startDate)) {
		throw new Error('Start date is greater than end date');
	}

	const revisions = await new Revision()
		.query('where', 'author_id', '=', editorId)
		.orderBy('created_at', 'ASC')
		.fetchAll({
			require: false
		});

	const revisionJSON = revisions ? revisions.toJSON() : [];
	const revisionDates = revisionJSON.map((revision) => format(new Date(revision.createdAt), 'LLL-yy'));
	const revisionsCount = _.countBy(revisionDates);

	const allMonthsInInterval = eachMonthOfInterval({
		end: endDate,
		start: startDate
	})
		.map(month => format(new Date(month), 'LLL-yy'))
		.reduce((accumulator, month) => {
			accumulator[month] = 0;
			return accumulator;
		}, {});

	return {...allMonthsInInterval, ...revisionsCount};
}

function achievementColToEditorGetJSON(achievementCol) {
	if (!achievementCol) {
		return {length: 0, model: null};
	}

	return {
		length: achievementCol.length,
		model: achievementCol.toJSON()
	};
}

router.get('/:id', async (req, res, next) => {
	const {AchievementUnlock, Revision} = req.app.locals.orm;
	const userId = parseInt(req.params.id, 10);

	const editorJSONPromise = getIdEditorJSONPromise(userId, req);

	const achievementColPromise = new AchievementUnlock()
		.where('editor_id', userId)
		.where('profile_rank', '<=', '3')
		.query((qb) => qb.limit(3))
		.orderBy('profile_rank', 'ASC')
		.fetchAll({
			require: false,
			withRelated: ['achievement']
		});

	const [achievementCol, editorJSON] = await Promise.all(
		[achievementColPromise, editorJSONPromise]
	).catch(next);

	editorJSON.activityData =
		await getEditorActivity(editorJSON.id, editorJSON.createdAt, Revision)
			.catch(next);

	const achievementJSON = achievementColToEditorGetJSON(achievementCol);

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
		script: '/js/editor/editor.js',
		title: `${props.editor.name}'s Profile`
	}));
});

// eslint-disable-next-line consistent-return
router.get('/:id/revisions', async (req, res, next) => {
	const {Editor, TitleUnlock} = req.app.locals.orm;

	const size = req.query.size ? parseInt(req.query.size, 10) : 20;
	const from = req.query.from ? parseInt(req.query.from, 10) : 0;

	try {
		// get 1 more result to check nextEnabled
		const orderedRevisions = await getOrderedRevisionForEditorPage(from, size + 1, req);
		const {newResultsArray, nextEnabled} = utils.getNextEnabledAndResultsArray(orderedRevisions, size);
		const editor = await new Editor({id: req.params.id}).fetch();
		const editorJSON = await getEditorTitleJSON(editor.toJSON(), TitleUnlock);

		const props = generateProps(req, res, {
			editor: editorJSON,
			from,
			nextEnabled,
			results: newResultsArray,
			showRevisionNote: true,
			size,
			tabActive: 1,
			tableHeading: 'Revision History'
		});

		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditorContainer
					{...propHelpers.extractEditorProps(props)}
				>
					<EditorRevisionPage
						{...propHelpers.extractChildProps(props)}
					/>
				</EditorContainer>
			</Layout>
		);

		res.send(target({
			markup,
			page: 'revisions',
			props: escapeProps(props),
			script: '/js/editor/editor.js',
			title: `${props.editor.name}'s Revisions`
		}));
	}
	catch (err) {
		return next(err);
	}
});

// eslint-disable-next-line consistent-return
router.get('/:id/revisions/revisions', async (req, res, next) => {
	const size = req.query.size ? parseInt(req.query.size, 10) : 20;
	const from = req.query.from ? parseInt(req.query.from, 10) : 0;

	try {
		const orderedRevisions = await getOrderedRevisionForEditorPage(from, size, req);
		res.send(orderedRevisions);
	}
	catch (err) {
		return next(err);
	}
});

function setAchievementUnlockedField(achievements, unlocks) {
	if (!unlocks) {
		return null;
	}

	const unlockIDSet = new Set(unlocks.map('attributes.achievementId'));

	const model = achievements.map((achievementType) => ({
		...achievementType.toJSON(),
		unlocked: unlockIDSet.has(achievementType.id)
	}));

	return {model};
}

router.get('/:id/achievements', async (req, res, next) => {
	const {AchievementType, AchievementUnlock} = req.app.locals.orm;

	const userId = parseInt(req.params.id, 10);
	const isOwner = isCurrentUser(userId, req.user);

	const editorJSONPromise = getIdEditorJSONPromise(userId, req)
		.catch(next);

	const unlocksPromise = new AchievementUnlock()
		.where('editor_id', userId)
		.fetchAll({require: false});

	const achievementTypesPromise = new AchievementType()
		.orderBy('id', 'ASC')
		.fetchAll();

	const [unlocks, editorJSON, achievementTypes] = await Promise.all([
		unlocksPromise, editorJSONPromise, achievementTypesPromise
	]);

	const achievementJSON =
		setAchievementUnlockedField(achievementTypes, unlocks);

	const props = generateProps(req, res, {
		achievement: achievementJSON,
		editor: editorJSON,
		isOwner,
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
					isOwner={props.isOwner}
				/>
			</EditorContainer>
		</Layout>
	);

	res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/editor/achievement.js',
		title: `${props.editor.name}'s Achievements`
	}));
});

async function rankUpdate(orm, editorId, bodyRank, rank) {
	const {AchievementUnlock} = orm;

	// Get the achievement unlock which is currently in this "rank"/slot
	const unlockToUnrank = await new AchievementUnlock({
		editorId,
		profileRank: rank
	})
		.fetch({require: false});


	// If there's a match, then unset the rank on the unlock, and save
	if (unlockToUnrank !== null) {
		await unlockToUnrank.set('profileRank', null).save();
	}

	if (bodyRank === '') {
		return false;
	}

	// Then fetch the achievement to be placed in the specified rank
	const unlockToRank = await new AchievementUnlock({
		achievementId: parseInt(bodyRank, 10),
		editorId
	})
		.fetch({require: true});

	// TODO: this can throw, so missing error handling (but so was old code)

	// And set the rank on the achievement and save it
	return unlockToRank.set('profileRank', rank).save();
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

			if (!isCurrentUser(userId, req.user)) {
				editorJSON = new Promise((resolve, reject) => reject(new Error('Not authenticated')));
			}
			else {
				editorJSON = new Promise(resolve => resolve(editordata.toJSON()));
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


// eslint-disable-next-line consistent-return
router.get('/:id/collections', async (req, res, next) => {
	const {Editor, TitleUnlock} = req.app.locals.orm;
	const size = req.query.size ? parseInt(req.query.size, 10) : 20;
	const from = req.query.from ? parseInt(req.query.from, 10) : 0;
	let type = req.query.type ? req.query.type : null;
	const entityTypes = _.keys(commonUtils.getEntityModels(req.app.locals.orm));
	if (!entityTypes.includes(type) && type !== null) {
		throw new error.BadRequestError(`Type ${type} do not exist`);
	}

	try {
		// fetch 1 more collections than required to check nextEnabled
		const orderedCollections = await getOrderedCollectionsForEditorPage(from, size + 1, type, req);
		const {newResultsArray, nextEnabled} = utils.getNextEnabledAndResultsArray(orderedCollections, size);
		const editor = await new Editor({id: req.params.id}).fetch();
		const editorJSON = await getEditorTitleJSON(editor.toJSON(), TitleUnlock);

		const props = generateProps(req, res, {
			editor: editorJSON,
			entityTypes,
			from,
			nextEnabled,
			results: newResultsArray,
			showIfOwnerOrCollaborator: true,
			showPrivacy: true,
			size,
			tabActive: 3,
			tableHeading: 'Collections'
		});
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<EditorContainer
					{...propHelpers.extractEditorProps(props)}
				>
					<CollectionsPage
						{...propHelpers.extractChildProps(props)}
					/>
				</EditorContainer>
			</Layout>
		);

		res.send(target({
			markup,
			page: 'collections',
			props: escapeProps(props),
			script: '/js/editor/editor.js',
			title: `${props.editor.name}'s Collections`
		}));
	}
	catch (err) {
		return next(err);
	}
});

// eslint-disable-next-line consistent-return
router.get('/:id/collections/collections', async (req, res, next) => {
	try {
		const size = req.query.size ? parseInt(req.query.size, 10) : 20;
		const from = req.query.from ? parseInt(req.query.from, 10) : 0;
		let type = req.query.type ? req.query.type : null;
		const entityTypes = _.keys(commonUtils.getEntityModels(req.app.locals.orm));
		if (!entityTypes.includes(type) && type !== null) {
			throw new error.BadRequestError(`Type ${type} do not exist`);
		}

		const orderedCollections = await getOrderedCollectionsForEditorPage(from, size, type, req);
		res.send(orderedCollections);
	}
	catch (err) {
		return next(err);
	}
});

export default router;
