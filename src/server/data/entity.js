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
require('../data/properties/alias');
require('../data/properties/identifier');
require('../data/properties/annotation');
require('../data/properties/disambiguation');
require('../data/relationship');

const Entity = new Model('Entity', {
	abstract: true,
	endpoint: 'entity'
});

Entity.extend({
	bbid: {
		type: 'uuid',
		map: 'entity_gid'
	},
	default_alias: {
		type: 'object',
		model: 'Alias'
	},
	revision: {
		type: 'object'
	},
	aliases: {
		type: 'ref',
		model: 'Alias',
		many: true,
		map: 'aliases_uri'
	},
	identifiers: {
		type: 'ref',
		model: 'Identifier',
		many: true,
		map: 'identifiers_uri'
	},
	disambiguation: {
		type: 'ref',
		model: 'Disambiguation',
		map: 'disambiguation_uri'
	},
	annotation: {
		type: 'ref',
		model: 'Annotation',
		map: 'annotation_uri'
	},
	relationships: {
		type: 'ref',
		model: 'Relationship',
		map: 'relationships_uri',
		many: true
	},
	last_updated: {
		type: 'date'
	},
	_type: {
		type: 'string'
	}
});

module.exports = Entity;
