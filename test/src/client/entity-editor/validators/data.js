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

export const EMPTY_SUBMISSION_SECTION = {
	...VALID_SUBMISSION_SECTION, note: null
};

export const VALID_AREA = {id: 1};
export const INVALID_AREA = {id: null};

export const INVALID_DATES = [
	// Incomplete dates
	{day: '10', month: '', year: '2014'},
	{day: '10', month: '02', year: ''},
	{day: '10', month: '', year: ''},

	/* Invalid day values */
	{day: '0', month: '05', year: '2014'},
	{day: '-1', month: '10', year: '2014'},
	{day: 'a', month: '11', year: '2014'},
	{day: '50', month: '08', year: '2014'},
	{day: '31', month: '11', year: '2014'},
	// Invalid day value (not a leap year)
	{day: '29', month: '02', year: '2014'},

	/* Invalid month values */
	{day: '18', month: '0', year: '2014'},
	{day: '18', month: '-1', year: '2014'},
	{day: '18', month: 'a', year: '2014'},
	{day: '18', month: '21', year: '2014'},

	/* Invalid year values */
	{day: '18', month: '11', year: 'asd'}

];

export const VALID_DATE_PAIR = [
	{first: {day: '', month: '', year: ''}, second: {day: '', month: '', year: ''}},
	{first: {day: '', month: '', year: ''}, second: {day: '', month: '', year: '1998'}},
	{first: {day: '', month: '', year: ''}, second: {day: '', month: '10', year: '1998'}},
	{first: {day: '', month: '', year: ''}, second: {day: '01', month: '01', year: '1998'}},
	{first: {day: '', month: '', year: '1997'}, second: {day: '', month: '', year: ''}},
	{first: {day: '', month: '', year: '1997'}, second: {day: '', month: '', year: '1998'}},
	{first: {day: '', month: '', year: '1997'}, second: {day: '', month: '02', year: '1998'}},
	{first: {day: '', month: '', year: '1997'}, second: {day: '01', month: '01', year: '1998'}},
	{first: {day: '', month: '12', year: '1997'}, second: {day: '', month: '', year: ''}},
	{first: {day: '', month: '12', year: '1997'}, second: {day: '', month: '', year: '1998'}},
	{first: {day: '', month: '12', year: '1997'}, second: {day: '', month: '01', year: '1998'}},
	{first: {day: '', month: '12', year: '1997'}, second: {day: '01', month: '01', year: '1998'}},
	{first: {day: '31', month: '12', year: '1997'}, second: {day: '', month: '', year: ''}},
	{first: {day: '31', month: '12', year: '1997'}, second: {day: '', month: '', year: '1998'}},
	{first: {day: '31', month: '12', year: '1997'}, second: {day: '', month: '02', year: '1998'}},
	{first: {day: '31', month: '12', year: '1997'}, second: {day: '01', month: '02', year: '1998'}},
	{first: {day: '', month: '1', year: '2019'}, second: {day: '', month: '02', year: '2019'}},
	{first: {day: '', month: '', year: '-900'}, second: {day: '', month: '', year: '-800'}},
	{first: {day: '', month: '1', year: '-900'}, second: {day: '', month: '02', year: '-900'}},
	{first: {day: '1', month: '1', year: '-900'}, second: {day: '02', month: '01', year: '-800'}}
];
export const INVALID_DATE_PAIR = [
	{first: {day: '', month: '', year: '1998'}, second: {day: '', month: '', year: '1997'}},
	{first: {day: '', month: '01', year: '1998'}, second: {day: '', month: '', year: '1997'}},
	{first: {day: '01', month: '01', year: '1998'}, second: {day: '', month: '', year: '1997'}},
	{first: {day: '', month: '', year: '1998'}, second: {day: '', month: '12', year: '1997'}},
	{first: {day: '', month: '01', year: '1998'}, second: {day: '', month: '12', year: '1997'}},
	{first: {day: '01', month: '01', year: '1998'}, second: {day: '', month: '12', year: '1997'}},
	{first: {day: '', month: '', year: '1998'}, second: {day: '31', month: '12', year: '1997'}},
	{first: {day: '', month: '01', year: '1998'}, second: {day: '31', month: '12', year: '1997'}},
	{first: {day: '01', month: '01', year: '1998'}, second: {day: '31', month: '12', year: '1997'}},
	{first: {day: '', month: '', year: '-800'}, second: {day: '', month: '', year: '-801'}}
];
export const INVALID_BEGIN_DATE_PAIR = [
	// Begin date is invalid
	{first: {day: '', month: '13', year: '1997'}, second: {day: '', month: '', year: '1992'}},
	{first: {day: '41', month: '12', year: '1992'}, second: {day: '', month: '', year: ''}},
	// Begin date is an invalid leap year
	{first: {day: '29', month: '02', year: '2014'}, second: {day: '', month: '12', year: '1997'}}
];
export const INVALID_END_DATE_PAIR = [
	{first: {day: '', month: '12', year: '1997'}, second: {day: '', month: '0', year: '1923'}},
	// End date is an invalid leap year
	{first: {day: '', month: '12', year: '1997'}, second: {day: '29', month: '02', year: '2014'}}
];
