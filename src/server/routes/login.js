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

const express = require('express');
const router = express.Router();
const passport = require('passport');
const status = require('http-status');

router.get('/login', (req, res) => {
	res.render('login', {
		error: req.query.error,
		title: 'Log In'
	});
});

router.get('/logout', (req, res) => {
	delete req.session.bearerToken;
	req.logout();
	res.redirect(status.SEE_OTHER, '/');
});

router.post('/login/handler', (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			console.log(err);
			// If an error occurs during login, send the user back.
			return res.redirect(status.MOVED_PERMANENTLY, `/login?error=${err.message}`);
		}

		if (!user) {
			return res.redirect(status.MOVED_PERMANENTLY, '/login?error=Login details incorrect');
		}

		req.logIn(user, (err) => {
			if (err) {
				return next(err);
			}

			const redirect = req.session.redirectTo ? req.session.redirectTo : '/';
			delete req.session.redirectTo;

			return res.redirect(status.SEE_OTHER, redirect);
		});
	})(req, res, next);
});

module.exports = router;
