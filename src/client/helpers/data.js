/*
 * Copyright (C) 2016  Sean Burke
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

const _find = require('lodash.find');

const data = {};

data.entityHasChanged = (initial, current) =>
	(initial && initial.bbid) !== (current && current.bbid);


data.getEntityLink = (entity) => {
	const bbid = entity.bbid;

	return `/${entity.type.toLowerCase()}/${bbid}`;
};

data.identifierIsValid = (typeId, value, identifierTypes) => {
	if (!value) {
		return false;
	}

	const selectedType = _find(identifierTypes, (type) => type.id === typeId);

	if (selectedType) {
		return new RegExp(selectedType.validationRegex).test(value);
	}

	return false;
};

module.exports = data;
