/*
 * Copyright (C) 2016  Ben Ockmore
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

import * as set from './set';


function formatNewReleaseEventSet(change) {
	function transformer(rhs) {
		return rhs.releaseEvents.map((releaseEvent) => releaseEvent.date);
	}

	return set.formatNewSet(
		change, 'Release Date', 'releaseEvents', transformer
	);
}

function formatReleaseEventAddOrDelete(change) {
	return set.formatItemAddOrDelete(
		change, 'Release Date', (side) => side && [side.date]
	);
}

function formatReleaseEventModified(change) {
	return set.formatItemModified(change, 'Release Date', ['date']);
}

export function format(change) {
	return set.format(
		change, 'releaseEventSet', 'releaseEvents',
		formatNewReleaseEventSet,
		formatReleaseEventAddOrDelete,
		formatReleaseEventModified
	);
}

export function changed(change) {
	return set.changed(change, 'releaseEventSet', 'releaseEvents');
}
