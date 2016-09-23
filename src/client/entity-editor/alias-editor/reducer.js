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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import Immutable from 'immutable';

const DEFAULT_ALIAS = Immutable.Map({
	name: '',
	sortName: '',
	language: null,
	primary: false
});

function reducer(
	state = Immutable.Map(),
	action
) {
	switch (action.type) {
		case 'ADD_ALIAS':
			return state.set(action.id, DEFAULT_ALIAS);
		case 'UPDATE_ALIAS_NAME':
			return state.setIn([action.index, 'name'], action.value);
		case 'UPDATE_ALIAS_SORT_NAME':
			return state.setIn([action.index, 'sortName'], action.value);
		case 'UPDATE_ALIAS_LANGUAGE':
			return state.setIn([action.index, 'language'], action.value);
		case 'UPDATE_ALIAS_PRIMARY':
			return state.setIn([action.index, 'primary'], action.value);
		case 'REMOVE_ALIAS':
			return state.delete(action.index);
		// no default
	}
	return state;
}

export default reducer;
