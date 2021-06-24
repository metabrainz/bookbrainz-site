/*
 * Copyright (C) 2021  Akash Gupta
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


/**
 * A function to extract individual attribute object corresponding to a attribute id
 * from attributes array.
 *
 * @param {array} attributes - Array of attributes.
 * @param {number} id - Attribute id.
 * @returns {void}
 */
export const getInitAttribute = (attributes, id) => {
	const relAttribute = attributes.filter(attribute => attribute.attributeType === id);
	if (relAttribute.length === 0) {
		return [];
	}

	return relAttribute[0];
};


/**
 * A function to insert all the individual attribute object(number, position etc) to
 * a array.
 *
 * @param {object} state - Relationship state.
 * @param {array} attributeTypes - All the attribute types associated with a relationship type.
 * @returns {array} Array of attributes.
 */
export const setAttribute = (state, attributeTypes) => {
	const attributes = attributeTypes.map(attribute => attribute.name);
	const result = [];
	if (attributes.includes('number')) {
		result.push(state.attributeNumber);
	}
	if (attributes.includes('position')) {
		result.push(state.attributePosition);
	}
	return result;
};

/**
 * This function returns the attribute name corresponding
 * to a attribute ID.
 *
 * @param {number} id - Attribute ID.
 * @returns {string}  returns the attribute name.
 */
export const getAttributeName = (id) => {
	switch (id) {
		case 1:
			return 'position';
		case 2:
			return 'number';
		default:
			return 'unnamed';
	}
};
