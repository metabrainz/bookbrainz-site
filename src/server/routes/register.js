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
var User = require('../data/user');
var UserType = require('../data/properties/user-type');

router.get('/', function(req, res) {
	var error = req.session.error;
	delete req.session.error;

	res.render('register', {
		error: error,
		title: 'Register'
	});
});

router.post('/handler', function(req, res, next) {
	if (!req.body.password) {
		req.session.error = 'No password set';
		res.redirect(303, '/register');

		return;
	}

	if (req.body.password !== req.body.password2) {
		req.session.error = 'Passwords did not match';
		res.redirect(303, '/register');

		return;
	}

	// This function should post a new user to the /user endpoint of the ws.
	UserType.find()
		.then(function(results) {
			var editorType;

			var hasEditorType = !results.every(function(userType) {
				if (userType.label === 'Editor') {
					editorType = userType;
					return false;
				}

				return true;
			});

			if (!hasEditorType) {
				throw new Error('Editor user type not found');
			}

			return User.create({
				name: req.body.username,
				email: req.body.email,
				password: req.body.password,
				user_type: {
					user_type_id: editorType.id
				}
			});
		})
		.then(function() {
			res.redirect(303, '/');
		})
		.catch(function(err) {
			next(err);
		});
});

module.exports = router;
