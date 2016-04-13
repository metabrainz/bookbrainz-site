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

'use strict';

const _ = require('lodash');

function formatRow(kind, key, lhs, rhs) {
	if (_.isNil(lhs) && _.isNil(rhs)) {
		return [];
	}

	if (kind === 'N' || _.isNil(lhs)) {
		return {kind: 'N', key, rhs};
	}

	if (kind === 'D' || _.isNil(rhs)) {
		return {kind: 'D', key, lhs};
	}

	return {kind, key, lhs, rhs};
}
module.exports.formatRow = formatRow;

function formatChange(change, label, transformer) {
	return formatRow(
		change.kind,
		label,
		transformer(change.lhs),
		transformer(change.rhs)
	);
}
module.exports.formatChange = formatChange;

function formatGenderChange(change) {
	return formatChange(
		change,
		'Gender',
		(side) => side && [side.name]
	);
}
module.exports.formatGenderChange = formatGenderChange;

function formatEndedChange(change) {
	return [
		formatChange(
			change,
			'Ended',
			(side) => [_.isNull(side) || side ? 'Yes' : 'No']
		)
	];
}
module.exports.formatEndedChange = formatEndedChange;

function formatTypeChange(change, label) {
	return formatChange(change, label, (side) => side && [side.label]);
}
module.exports.formatTypeChange = formatTypeChange;

function formatScalarChange(change, label) {
	return formatChange(change, label, (side) => side && [side]);
}
module.exports.formatScalarChange = formatScalarChange;
