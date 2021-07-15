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

import _ from 'lodash';


export function formatRow(kind, key, lhs, rhs) {
	if (_.isNil(lhs) && _.isNil(rhs)) {
		return [];
	}

	if (kind === 'N' || _.isNil(lhs)) {
		return {
			key,
			kind: 'N',
			rhs
		};
	}

	if (kind === 'D' || _.isNil(rhs)) {
		return {
			key,
			kind: 'D',
			lhs
		};
	}

	return {
		key,
		kind,
		lhs,
		rhs
	};
}

export function formatChange(change, label, transformer) {
	return formatRow(
		change.kind,
		label,
		transformer(change.lhs),
		transformer(change.rhs)
	);
}

export function formatGenderChange(change) {
	return formatChange(
		change,
		'Gender',
		(side) => side && [side.name]
	);
}

export function formatEndedChange(change) {
	return [
		formatChange(
			change,
			'Ended',
			(side) => [_.isNull(side) || (side ? 'Yes' : 'No')]
		)
	];
}

export function formatTypeChange(change, label) {
	// eslint-disable-next-line consistent-return
	return formatChange(change, label, (side) => {
		if (typeof side === 'string') {
			return [side];
		 }
		 else if (side) {
			 return [side.label];
		 }
	});
}

export function formatScalarChange(change, label) {
	return formatChange(change, label, (side) => side && [side]);
}

export function formatAreaChange(change, label) {
	return formatChange(
		change,
		label || 'Area',
		// eslint-disable-next-line
		(side) => typeof side === 'string' ? [side] : side && [side.name]
	);
}
