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

var express = require('express');
var router = express.Router();
var auth = require('../helpers/auth');

router.get('/login', function(req, res) {
	res.render('login', {
		error: req.query.error,
		title: 'Log In'
	});
});

router.get('/logout', function(req, res) {
	delete req.session.bearerToken;
	req.logout();
	res.redirect(303, '/');
});

router.post('/login/handler', auth.authenticate(), function(req, res) {
	var redirect = req.session.redirectTo ? req.session.redirectTo : '/';
	delete req.session.redirectTo;

	res.redirect(303, redirect);
}, function(err, req, res, next) {
	/* If an error occurs during login, send the user back. */
	res.redirect(301, '/login?error=' + err.message);
});

module.exports = router;
