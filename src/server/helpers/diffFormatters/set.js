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


export function formatNewSet(change, label, itemProp, transformerFunc) {
	const {rhs} = change;
	if (rhs[itemProp] && rhs[itemProp].length > 0) {
		return [base.formatRow('N', label, null, transformerFunc(rhs))];
	}

	return [];
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
	const setAdded =
		change.kind === 'N' && _.isEqual(change.path, [setProp]);
	if (setAdded) {
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
