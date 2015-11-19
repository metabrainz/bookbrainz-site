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

const Handlebars = require('handlebars');
const utils = require('./utils');

function renderRelationship(entities, relationship) {
	const template = Handlebars.compile(relationship.template);

	const data = {
		entities: entities.map((entity) => {
			const name = entity.default_alias ?
				entity.default_alias.name : '(unnamed)';
			return `<a href="${utils.getEntityLink(entity)}">${name}</a>`;
		})
	};

	return template(data);
}

module.exports = renderRelationship;
