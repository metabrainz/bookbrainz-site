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
		passport.authenticate('musicbrainz-oauth2', (authErr, user, info) => {
			if (authErr) {
				return next(authErr);
			}

			if (!user) {
				// Set profile in session, and continue to registration
				req.session.mbProfile = info;
				return res.redirect('/register/details');
			}

			return req.logIn(user, (loginErr) => {
				if (loginErr) {
					return next(loginErr);
				}

				return res.redirect('/');
			});
		})(req, res, next);
	}
);

module.exports = router;
