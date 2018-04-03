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

export const VALID_ALIASES = {
	1: VALID_ALIAS,
	n0: VALID_ALIAS
};

export const INVALID_ALIAS = {...VALID_ALIAS, language: null};

export const INVALID_ALIASES = {
	1: VALID_ALIAS,
	n0: INVALID_ALIAS
};

export const VALID_IDENTIFIER = {
	type: 1,
	value: 'B076KQRJV1'
};

export const VALID_IDENTIFIERS = {
	1: VALID_IDENTIFIER,
	n0: VALID_IDENTIFIER
};

export const IDENTIFIER_TYPES = [{
	id: 1,
	validationRegex: /^(?:B\d{2}\w{7}|\d{9}[X\d])$/
}];

export const INVALID_IDENTIFIER = {...VALID_IDENTIFIERS, value: 'B076QRJV1'};

export const INVALID_IDENTIFIERS = {
	1: VALID_IDENTIFIERS,
	n0: INVALID_IDENTIFIER
};

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

export const INVALID_DATES = [
	// Incomplete dates
	'-1', '1', '1-',
	'-19', '19', '19-', '1-9',
	'-192', '1-92', '19-2', '192', '192-',
	'-1923', '1-923', '19-23', '192-3', '19-23', '192-3', '1923-',
	'2014-2', '2014-02-2', '2014-02-',

	/* Invalid formats */

	 // MM-YYYY or DD-YYYY
	'12-1912',
	// DD-MM-YYYY or MM-DD-YYYY
	'01-01-1912',
	// DD-YYYY-MM or MM-YYYY-DD
	'02-1992-12',
	 // MM-DD or DD-MM
	'12-02',
	// ISO week
	'2018-W14',
	// ISO Date with week number
	'2018-W14-1',
	// ISO Date without year
	'--04-02',
	// ISO Ordinal date
	'2018-092',
	// Other ISO formats
	'2018-04-02T13:03:26+00:00', '2018-04-02T13:03:26Z', '20180402T130326Z',

	/* Invalid dates */

	// Invalid MM value
	'1912-13',
	// Invalid MM value
	'1912-13-01',
	// Invalid DD value
	'1912-11-31',
	// Invalid DD value (not a leap year)
	'2014-02-29'
];

export const VALID_DATE_PAIR = [
	{first: '', second: ''},
	{first: '', second: '1998'},
	{first: '', second: '1998-01'},
	{first: '', second: '1998-01-01'},
	{first: '1997', second: ''},
	{first: '1997', second: '1998'},
	{first: '1997', second: '1998-01'},
	{first: '1997', second: '1998-01-01'},
	{first: '1997-12', second: ''},
	{first: '1997-12', second: '1998'},
	{first: '1997-12', second: '1998-01'},
	{first: '1997-12', second: '1998-01-01'},
	{first: '1997-12-31', second: ''},
	{first: '1997-12-31', second: '1998'},
	{first: '1997-12-31', second: '1998-01'},
	{first: '1997-12-31', second: '1998-01-01'}
];
export const INVALID_DATE_PAIR = [
	{first: '1998', second: '1997'},
	{first: '1998-01', second: '1997'},
	{first: '1998-01-01', second: '1997'},
	{first: '1998', second: '1997-12'},
	{first: '1998-01', second: '1997-12'},
	{first: '1998-01-01', second: '1997-12'},
	{first: '1998', second: '1997-12-31'},
	{first: '1998-01', second: '1997-12-31'},
	{first: '1998-01-01', second: '1997-12-31'}
];
