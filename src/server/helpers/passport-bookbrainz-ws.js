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

const util = require('util');
const PasswordGrantStrategy = require('passport-oauth2-password-grant');
const User = require('../data/user');

function BBWSStrategy(baseOptions, verify) {
	const options = baseOptions || {};

	if (!options.wsURL) {
		throw new TypeError('BBWSStrategy requires a wsURL option');
	}

	this._wsURL = options.wsURL;
	delete options.wsURL;

	options.tokenURL = `${this._wsURL}/oauth/token`;
	options.passReqToCallback = true;

	PasswordGrantStrategy.call(this, options, verify);
	this.name = 'bbws';
}

util.inherits(BBWSStrategy, PasswordGrantStrategy);

BBWSStrategy.prototype.userProfile =
function getuserProfile(accessToken, done) {
	User.getCurrent(accessToken)
		.then((user) => {
			const profile = {
				id: user.id,
				name: user.name
			};

			done(null, profile);
		})
		.catch((err) => {
			console.log(err.stack);
			return done(new Error('Internal error fetching user profile'));
		});
};

module.exports = BBWSStrategy;
