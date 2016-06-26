/*
 * Copyright (C) 2016       Ben Ockmore
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

const co = require('co');
const express = require('express');
const router = express.Router();

const passport = require('passport');
const Editor = require('bookbrainz-data').Editor;
const SiteError = require('../helpers/error.js').SiteError;

router.get('/auth', passport.authenticate('musicbrainz-oauth2'));

const linkAccount = co.wrap(function* linkAccount(req, res) {
	const bbUser = req.editorJSON;
	const mbUser = req.user;
	const existingEditor = yield new Editor({id: bbUser.id}).fetch();

	const updatedEditor = yield existingEditor
		.save({
			metabrainzUserId: mbUser.metabrainzUserId,
			cachedMetabrainzName: mbUser.name
		});

	const userJSON = req.session.passport.user = updatedEditor.toJSON();
	res.redirect(`/editor/${userJSON.id}`);
});

router.get('/cb',
	(req, res, next) => {
		if (req.session && req.session.passport && req.session.passport.user) {
			req.editorJSON = req.session.passport.user;
		}
		next();
	},
	passport.authenticate('musicbrainz-oauth2', {failureRedirect: '/login'}),
	(req, res) => {
		const userAlreadyLinked = Boolean(
			req.session.passport.user && req.session.passport.user.id
		);
		const userAlreadyAuthenticated = Boolean(req.editorJSON);

		if (userAlreadyAuthenticated) {
			if (userAlreadyLinked) {
				throw new SiteError(
					'Cannot link to an MeB account while already linked'
				);
			}

			return linkAccount(req, res);
		}

		if (userAlreadyLinked) {
			return res.redirect('/');
		}
	}
);

module.exports = router;
