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

import {
	ADD_ALIAS_ROW, REMOVE_ALIAS_ROW, REMOVE_EMPTY_ALIASES, UPDATE_ALIAS_LANGUAGE,
	UPDATE_ALIAS_NAME, UPDATE_ALIAS_PRIMARY, UPDATE_ALIAS_SORT_NAME
} from './actions';
import Immutable from 'immutable';


const EMPTY_ALIAS = Immutable.Map({
	language: null,
	name: '',
	primary: false,
	sortName: ''
});

function reducer(
	state = Immutable.OrderedMap(),
	action
) {
	const {payload, type} = action;
	switch (type) {
		case ADD_ALIAS_ROW:
			return state.set(payload, EMPTY_ALIAS);
		case UPDATE_ALIAS_NAME:
			return state.setIn([payload.rowId, 'name'], payload.value);
		case UPDATE_ALIAS_SORT_NAME:
			return state.setIn([payload.rowId, 'sortName'], payload.value);
		case UPDATE_ALIAS_LANGUAGE:
			return state.setIn([payload.rowId, 'language'], payload.value);
		case UPDATE_ALIAS_PRIMARY:
			return state.setIn([payload.rowId, 'primary'], payload.value);
		case REMOVE_ALIAS_ROW:
			return state.delete(payload);
		case REMOVE_EMPTY_ALIASES:
			return state.filterNot(alias =>
				alias.get('name') === '');
		// no default
	}
	return state;
}

export default reducer;
