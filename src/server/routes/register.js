/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Annie Zhou
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

import * as error from '../../common/helpers/error';
import * as search from '../../common/helpers/search';
import _ from 'lodash';
import express from 'express';
import log from 'log';


const router = express.Router();

router.post('/handler', async (req, res) => {
	try {
		const {Editor, EditorType} = req.app.locals.orm;

		// Check whether the user is logged in - if so, redirect to profile page
		if (req.user) {
			return res.redirect(`/editor/${req.user.id}`);
		}

		if (!req.session.mbProfile) {
			return res.redirect('/auth');
		}

		// Fetch the default EditorType from the database
		const editorType = await EditorType.forge({label: 'Editor'})
			.fetch({require: true});

		// Create a new Editor and add to the database

		const editor = await new Editor({
			cachedMetabrainzName: req.session.mbProfile.name,
			genderId: req.body.gender,
			metabrainzOauthAccessToken: req.session.mbProfile.metabrainzOauthAccessToken,
			metabrainzOauthRefreshToken: req.session.mbProfile.metabrainzOauthRefreshToken,
			metabrainzUserId: req.session.mbProfile.sub,
			name: req.body.displayName,
			typeId: editorType.id
		})
			.save();

		req.session.mbProfile = null;

		const editorJSON = editor.toJSON();

		// Type needed for indexing
		editor.set('type', 'Editor');
		await search.indexEntity(editor);

		return res.status(200).send(editorJSON);
	}
	catch (err) {
		if (_.isMatch(err, {constraint: 'editor_name_key'})) {
			return error.sendErrorAsJSON(res, new error.FormSubmissionError(
				'That username already exists - please try using another,' +
			' or contact us to have your existing BookBrainz account' +
			' linked to a MusicBrainz account.'
			));
		}
		log.error(err);

		return error.sendErrorAsJSON(res, new error.FormSubmissionError(
			'Something went wrong when registering, please try again!'
		));
	}
});

export default router;
