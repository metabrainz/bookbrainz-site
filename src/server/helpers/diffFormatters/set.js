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

import * as base from './base';
import _ from 'lodash';


/**
 * Formats a change that adds a whole set (kind 'N') or removes a whole set
 * (kind 'D'). A set is removed when its entity is deleted or merged into
 * another entity, so the old set is in `change.lhs` and `change.rhs` is empty.
 * @param {Object} change - The deep-diff change for the set.
 * @param {string} label - The label to show for the set.
 * @param {string} itemProp - The property of the set that holds its items.
 * @param {Function} transformerFunc - Turns a set into the values to display.
 * @returns {Array} The formatted rows, or an empty array if the set is empty.
 */
export function formatNewSet(change, label, itemProp, transformerFunc) {
	const isDeletion = change.kind === 'D';
	const setSide = isDeletion ? change.lhs : change.rhs;
	if (!setSide?.[itemProp]?.length) {
		return [];
	}

	const items = transformerFunc(setSide);
	return isDeletion ?
		[base.formatRow('D', label, items, null)] :
		[base.formatRow('N', label, null, items)];
}

export function formatItemAddOrDelete(change, label, transformerFunc) {
	return [
		base.formatChange(change, label, transformerFunc)
	];
}

export function formatItemModified(change, label, formattedProps) {
	if (change.path.length > 3 && _.includes(formattedProps, change.path[3])) {
		return [
			base.formatChange(change, label, (side) => side && [side])
		];
	}

	return [];
}

export function format(
	change, setProp, itemProp, newSetFormatter, addDeleteFormatter,
	modifyFormatter
) {
	// The whole set was added, or removed (e.g. its entity was merged away).
	// A removed set must not be treated as a single removed item: it has no
	// index and its lhs is the set itself, which used to show "Language
	// undefined" (or crash) on merge revisions (BB-807).
	const setAddedOrRemoved =
		(change.kind === 'N' || change.kind === 'D') &&
		_.isEqual(change.path, [setProp]);
	if (setAddedOrRemoved) {
		return newSetFormatter(change);
	}

	const itemAddDeleteModify = (change.kind === 'D' && change.path[0] === setProp) ||
		(change.path.length > 1 && change.path[0] === setProp &&
			change.path[1] === itemProp);
	if (itemAddDeleteModify) {
		if (change.kind === 'A' || change.kind === 'D') {
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

export function changed(change, setProp, itemProp) {
	return _.isEqual(change.path, [setProp]) ||
		_.isEqual(change.path.slice(0, 2), [setProp, itemProp]);
}
