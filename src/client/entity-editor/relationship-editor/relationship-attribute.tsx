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

import * as React from 'react';
import type {Attribute} from './types';
import PropTypes from 'prop-types';
import {getAttributeName} from './helper';


type RelationshipAttributeProps = {
    attributes: Array<Attribute>,
    showAttributes: boolean
};

function getAttributeForDisplay(attribute, key) {
	if (!attribute) {
		return null;
	}
	const attributeName = getAttributeName(attribute.attributeType);
	const attributeValue = attribute.value?.textValue;
	if (!attributeValue) {
		return null;
	}
	switch (attributeName) {
		case 'number':
			return <span key={key}>({attributeName}: {attributeValue})</span>;
		default:
			return null;
	}
}

function RelationshipAttribute({attributes, showAttributes}: RelationshipAttributeProps) {
	if (showAttributes) {
	    return (
			<>{attributes.map((attribute, index) => getAttributeForDisplay(attribute, index))}</>
		);
	}
	return null;
}
RelationshipAttribute.displayName = 'RelationshipAttribute';
RelationshipAttribute.propTypes = {
	attributes: PropTypes.array,
	showAttributes: PropTypes.bool
};
RelationshipAttribute.defaultProps = {
	attributes: [],
	showAttributes: false
};
export default RelationshipAttribute;
