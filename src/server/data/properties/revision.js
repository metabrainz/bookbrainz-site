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

const Model = require('../../helpers/model');
require('../../data/entity');
require('../../data/user');

const Revision = new Model('Revision', {
	endpoint: 'revision'
});

Revision.extend({
	id: {
		type: 'number',
		map: 'revision_id'
	},
	user: {
		type: 'object',
		model: 'User'
	},
	entity: {
		type: 'ref',
		model: 'Entity',
		map: 'entity_uri'
	},
	relationship: {
		type: 'ref',
		model: 'Relationship',
		map: 'relationship_uri'
	},
	created_at: {
		type: 'date'
	},
	changes: {
		type: 'object'
	},
	note: {
		type: 'string'
	}
});

module.exports = Revision;
