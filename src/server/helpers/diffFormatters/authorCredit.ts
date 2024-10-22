/*
 * Copyright (C) 2020 Nicolas Pelletier
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


type AuthorCreditNameT = {
	authorBbid: string,
	joinPhrase: string,
	name: string,
	position: number,
};


function authorCreditNameForDisplay(authorCreditName: AuthorCreditNameT) {
	if (!authorCreditName) {
		return ['-'];
	}
	return [`${authorCreditName.name}${authorCreditName.joinPhrase}`];
}

function authorCreditNamesForDisplay(rhs: {names: AuthorCreditNameT[]}) {
	return rhs?.names?.sort((a, b) => a.position - b.position)
		.map(authorCreditNameForDisplay);
}

function formatNewAuthorCredit(change) {
	return set.formatNewSet(change, 'Author Credit', 'names', authorCreditNamesForDisplay);
}

function formatAuthorCreditAddOrDelete(change) {
	return set.formatItemAddOrDelete(
		change, `Author Credit ${change.item?.rhs?.position + 1 || 'removed'}`, authorCreditNamesForDisplay
	);
}

function formatAuthorCreditModified(change) {
	return set.formatItemModified(change, `Author Credit ${change.path[2] + 1}`, ['names', 'name', 'position', 'authorBBID']);
}

export function format(change) {
	return set.format(
		change, 'authorCredit', 'names',
		formatNewAuthorCredit,
		formatAuthorCreditAddOrDelete,
		formatAuthorCreditModified
	);
}

export function changed(change) {
	return set.changed(change, 'authorCredit', 'names');
}
