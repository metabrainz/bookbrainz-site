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

const Model = require('../helpers/model');
require('../data/properties/gender');
require('../data/properties/user-type');

const User = new Model('User', {
	endpoint: 'user'
});

User.extend({
	id: {
		type: 'number',
		map: 'user_id'
	},
	name: {
		type: 'string'
	},
	password: {
		type: 'string'
	},
	user_type: {
		type: 'object',
		model: 'UserType'
	},
	email: {
		type: 'string'
	},
	reputation: {
		type: 'number'
	},
	bio: {
		type: 'string'
	},
	created_at: {
		type: 'date'
	},
	active_at: {
		type: 'date'
	},
	total_revisions: {
		type: 'number'
	},
	revisions_applied: {
		type: 'number'
	},
	revisions_reverted: {
		type: 'number'
	},
	gender: {
		type: 'object',
		model: 'Gender'
	}
});

User.getCurrent = function getCurrent(accessToken) {
	return this.findOne({
		path: '/account/',
		accessToken
	});
};

module.exports = User;
