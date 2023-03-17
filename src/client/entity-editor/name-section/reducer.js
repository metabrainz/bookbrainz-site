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
	UPDATE_DISAMBIGUATION_FIELD, UPDATE_LANGUAGE_FIELD, UPDATE_NAME_FIELD,
	UPDATE_SEARCH_RESULTS, UPDATE_SORT_NAME_FIELD, UPDATE_WARN_IF_EXISTS
} from './actions';
import Immutable from 'immutable';


function reducer(
	state = Immutable.Map({
		disambiguation: '',
		exactMatches: [],
		language: null,
		name: '',
		searchResults: [],
		sortName: ''
	}),
	action
) {
	const {payload, type} = action;
	switch (type) {
		case UPDATE_NAME_FIELD:
			return state.set('name', payload);
		case UPDATE_SORT_NAME_FIELD:
			return state.set('sortName', payload);
		case UPDATE_LANGUAGE_FIELD:
			return state.set('language', payload);
		case UPDATE_DISAMBIGUATION_FIELD:
			return state.set('disambiguation', payload);
		case UPDATE_SEARCH_RESULTS:
			return state.set('searchResults', payload);
		case UPDATE_WARN_IF_EXISTS:
			return state.set('exactMatches', payload);
		// no default
	}
	return state;
}

export default reducer;
