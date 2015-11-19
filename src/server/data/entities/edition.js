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
const Entity = require('../../data/entity');
require('../../data/properties/language');
require('../../data/properties/edition-format');
require('../../data/properties/edition-status');
require('../../data/entities/publication');
require('../../data/entities/publisher');

const Edition = new Model('Edition', {
	base: Entity,
	endpoint: 'edition'
});

Edition.extend({
	publication: {
		type: 'ref',
		model: 'Publication',
		map: 'publication_uri'
	},
	creator_credit: {
		type: 'object'
	},
	edition_format: {
		type: 'object',
		model: 'EditionFormat'
	},
	edition_status: {
		type: 'object',
		model: 'EditionStatus'
	},
	publisher: {
		type: 'ref',
		model: 'Publisher',
		map: 'publisher_uri'
	},
	language: {
		type: 'object',
		model: 'Language'
	},
	release_date: {
		type: 'date'
	},
	width: {
		type: 'number'
	},
	height: {
		type: 'number'
	},
	depth: {
		type: 'number'
	},
	weight: {
		type: 'number'
	},
	pages: {
		type: 'number'
	}
});

module.exports = Edition;
