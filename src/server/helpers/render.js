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
// @flow

import * as utils from './utils';
import Handlebars from 'handlebars';


type EntityInRelationship = {
	bbid: number | string,
	defaultAlias?: {name: string},
	type: string
};

type Relationship = {
	source: EntityInRelationship,
	target: EntityInRelationship,
	type: {displayTemplate: string}
};

/**
 * @typedef {Object} EntityInRelationship
 * @property {number|string} bbid
 * @property {?Object} defaultAlias
 * @property {string} defaultAlias.name
 * @property {string} type
 */

/**
 * @typedef {Object} Relationship
 * @property {EntityInRelationship} source
 * @property {EntityInRelationship} target
 * @property {Object} type
 * @property {string} type.displayTemplate
 */

/**
 * Renders a relationship object.
 * @param {Relationship} relationship - Relationship object.
 * @returns {string} - Rendered HTML string.
 */
function renderRelationship(relationship: Relationship) {
	const template = Handlebars.compile(
		relationship.type.displayTemplate,
		{noEscape: true}
	);

	const data = {
		entities: [
			relationship.source,
			relationship.target
		].map((entity) => {
			// Linkify source and target based on default alias
			const name =
				entity.defaultAlias ? entity.defaultAlias.name : '(unnamed)';
			return `<a href="${utils.getEntityLink(entity)}">${name}</a>`;
		})
	};

	return template(data);
}

export default renderRelationship;
