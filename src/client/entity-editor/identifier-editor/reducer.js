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
	ADD_IDENTIFIER, REMOVE_IDENTIFIER, UPDATE_IDENTIFIER_TYPE,
	UPDATE_IDENTIFIER_VALUE
} from './actions';
import Immutable from 'immutable';

const DEFAULT_IDENTIFIER = Immutable.Map({
	value: '',
	type: null
});

function reducer(
	state = Immutable.Map(),
	action
) {
	switch (action.type) {
		case ADD_IDENTIFIER:
			return state.set(action.id, DEFAULT_IDENTIFIER);
		case UPDATE_IDENTIFIER_VALUE:
			{
				const updatedValue = state.setIn(
					[action.index, 'value'], action.value
				);
				if (action.suggestedType) {
					return updatedValue.setIn(
						[action.index, 'type'], action.suggestedType.id
					);
				}

				return updatedValue;
			}
		case UPDATE_IDENTIFIER_TYPE:
			return state.setIn([action.index, 'type'], action.value);
		case REMOVE_IDENTIFIER:
			return state.delete(action.index);

		// no default
	}
	return state;
}

export default reducer;
