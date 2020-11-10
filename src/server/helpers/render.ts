/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2018  Eshan Singh
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

import * as utils from './utils';

import {ENTITY_TYPE_ICONS} from '../../client/helpers/entity';
import _ from 'lodash';


type EntityInRelationship = {
	bbid: string,
	defaultAlias?: {name: string},
	type: string
};

type Relationship = {
	source: EntityInRelationship,
	target: EntityInRelationship,
	type: {displayTemplate: string, linkPhrase: string}
};

/**
 * @typedef {Object} EntityInRelationship
 * @property {string} bbid
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
 * Returns the markup corresponding to the given entity relationship.
 * This markup is defined by a Handlebars template in
 * relationship.type.displayTemplate.
 * This function is used, for example, to render
 * relationships on entity display pages.
 * @param {Relationship} relationship - Relationship object.
 * @returns {string} - Rendered HTML string.
 */
function renderRelationship(relationship: Relationship) {
	const inputsInvalid =
		!relationship.source || !relationship.target ||
		!_.isString(_.get(relationship, 'type.linkPhrase'));
	if (inputsInvalid) {
		/* eslint-disable prefer-template */
		throw new TypeError(
			'Invalid inputs to renderRelationship:\n' +
			JSON.stringify(relationship, null, 2)
		);
		/* eslint-enable prefer-template */
	}

	function template(data) {
		return (
			`${data.entities[0]} ` +
			`${relationship.type.linkPhrase} ` +
			`${data.entities[1]}`
		);
	}

	const data = {
		entities: [
			relationship.source,
			relationship.target
		].map((entity) => {
			// Linkify source and target based on default alias
			const name = _.get(entity, 'defaultAlias.name', '(unnamed)');
			const entityIcon = `<i class="fa fa-${ENTITY_TYPE_ICONS[entity.type]} margin-right-0-5"></i>`;
			// eslint-disable-next-line prefer-template
			return entityIcon + `<a href="${utils.getEntityLink(entity)}">${name}</a>`;
		})
	};

	return template(data);
}

export default renderRelationship;
