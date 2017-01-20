/*
 * Copyright (C) 2015-2016  Ben Ockmore
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
const _ = require('lodash');

const formatRow = require('./base').formatRow;
const formatChange = require('./base').formatChange;

function formatNewSet(change, label, itemProp, transformerFunc) {
	const rhs = change.rhs;
	if (rhs[itemProp] && rhs[itemProp].length > 0) {
		return [formatRow('N', label, null, transformerFunc(rhs))];
	}

	return [];
}
module.exports.formatNewSet = formatNewSet;

function formatItemAddOrDelete(change, label, transformerFunc) {
	return [
		formatChange(change.item, label, transformerFunc)
	];
}
module.exports.formatItemAddOrDelete = formatItemAddOrDelete;

function formatItemModified(change, label, formattedProps) {
	if (change.path.length > 3 && _.includes(formattedProps, change.path[3])) {
		return [
			formatChange(change, label, (side) => side && [side])
		];
	}

	return [];
}
module.exports.formatItemModified = formatItemModified;

function formatSet(
	change, setProp, itemProp, newSetFormatter, addDeleteFormatter,
	modifyFormatter
) {
	const setAdded =
		change.kind === 'N' && _.isEqual(change.path, [setProp]);
	if (setAdded) {
		return newSetFormatter(change);
	}

	const itemAddDeleteModify =
		change.path.length > 1 && change.path[0] === setProp &&
			change.path[1] === itemProp;
	if (itemAddDeleteModify) {
		if (change.kind === 'A') {
			// Item added to or deleted from set
			return addDeleteFormatter(change);
		}

		if (change.kind === 'E') {
			// Item in set changed
			return modifyFormatter(change);
		}
	}

	return null;
}
module.exports.format = formatSet;

function setChanged(change, setProp, itemProp) {
	return _.isEqual(change.path, [setProp]) ||
		_.isEqual(change.path.slice(0, 2), [setProp, itemProp]);
}
module.exports.changed = setChanged;
