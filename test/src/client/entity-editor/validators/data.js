/*
 * Copyright (C) 2017  Ben Ockmore
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

export const VALID_ALIAS = {
	language: 1,
	name: 'test',
	primary: true,
	sortName: 'test'
};

export const VALID_ALIASES = [
	VALID_ALIAS, VALID_ALIAS
];

export const INVALID_ALIAS = {...VALID_ALIAS, language: null};

export const INVALID_ALIASES = [
	VALID_ALIAS, INVALID_ALIAS
];


export const VALID_IDENTIFIER = {
	type: 1,
	value: 'B076KQRJV1'
};

export const VALID_IDENTIFIERS = [
	VALID_IDENTIFIER, VALID_IDENTIFIER
];

export const IDENTIFIER_TYPES = [{
	id: 1,
	validationRegex: /^(?:B\d{2}\w{7}|\d{9}[X\d])$/
}];

export const INVALID_IDENTIFIER = {...VALID_IDENTIFIERS, value: 'B076QRJV1'};

export const INVALID_IDENTIFIERS = [
	VALID_IDENTIFIERS, INVALID_IDENTIFIER
];

export const VALID_NAME_SECTION = {
	disambiguation: '',
	language: 1,
	name: 'test',
	sortName: 'test'
};

export const INVALID_NAME_SECTION = {...VALID_NAME_SECTION, language: null};

export const VALID_SUBMISSION_SECTION = {
	note: 'blah'
};

export const INVALID_SUBMISSION_SECTION = {
	...VALID_SUBMISSION_SECTION, note: null
};

export const VALID_AREA = {id: 1};
export const INVALID_AREA = {id: null};
