/*
 * Copyright (C) 2016  Daniel Hsing
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

const React = require('react');
const _ = require('lodash');

/**
 * Returns list of component children that have been injected with the specified
 * props (does not override existing ones)
 * @param {Object} props - The props object that contains children and will be
 * re-injected into children
 * @returns {Array} list of children
 */
function injectChildElemsWithProps(props) {
	'use strict';
	const propsWithoutChild = _.omit(props, 'children');
	return React.Children.map(props.children, (Child) => {
		const filteredProps = Object.assign({}, propsWithoutChild, Child.props);
		return React.cloneElement(Child, filteredProps);
	});
}

/**
 * Injects entity model object with a default alias name property.
 *
 * @param {object} instance - Entity object.
 * @returns {object} - New object with injected properties.
 */
function injectDefaultAliasName(instance) {
	'use strict';
	if (instance && instance.name) {
		return Object.assign({}, instance, {
			defaultAlias: {
				name: instance.name
			}
		});
	}
	return instance;
}

exports.injectChildElemsWithProps = injectChildElemsWithProps;
exports.injectDefaultAliasName = injectDefaultAliasName;
