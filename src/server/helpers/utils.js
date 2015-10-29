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

const request = require('superagent');
const Promise = require('bluebird');
require('superagent-bluebird-promise');

function getEntityLink(entity) {
	const bbid = entity.entity_gid || entity.bbid;
	return `/${entity._type.toLowerCase()}/${bbid}`;
}

// Returns a Promise which fulfills with an entity with aliases and data.
function getEntity(ws, entityGid, fetchOptions) {
	const entityPromise = request.get(`${ws}/entity/${entityGid}`).promise()
		.then((entityResponse) => entityResponse.body);

	return entityPromise.then((entity) => {
		if (fetchOptions.data) {
			entity.data = request.get(entity.data_uri).promise()
				.then((dataResponse) => dataResponse.body);
		}

		if (fetchOptions.aliases) {
			entity.aliases = request.get(entity.aliases_uri).promise()
				.then((aliasesResponse) => aliasesResponse.body);
		}

		if (fetchOptions.annotation) {
			entity.annotation = request.get(entity.annotation_uri).promise()
				.then((annotationResponse) => annotationResponse.body);
		}

		if (fetchOptions.disambiguation) {
			entity.disambiguation = request.get(entity.disambiguation_uri)
				.promise()
				.then((disambiguationResponse) => disambiguationResponse.body);
		}

		if (fetchOptions.relationships) {
			entity.relationships = request.get(entity.relationships_uri)
				.promise()
				.then((relationshipsResponse) => relationshipsResponse.body);
		}

		return Promise.props(entity);
	});
}

module.exports = {getEntityLink, getEntity};
