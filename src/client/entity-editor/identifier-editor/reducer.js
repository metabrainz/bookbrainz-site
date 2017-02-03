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
	ADD_IDENTIFIER_ROW, REMOVE_IDENTIFIER_ROW, UPDATE_IDENTIFIER_TYPE,
	UPDATE_IDENTIFIER_VALUE
} from './actions';
import Immutable from 'immutable';

const EMPTY_IDENTIFIER = Immutable.Map({
	type: null,
	value: ''
});

function reducer(
	state = Immutable.OrderedMap(),
	action
) {
	const {type, payload} = action;
	switch (type) {
		case ADD_IDENTIFIER_ROW:
			return state.set(payload, EMPTY_IDENTIFIER);
		case UPDATE_IDENTIFIER_VALUE:
			{
				const updatedValue = state.setIn(
					[payload.rowId, 'value'], payload.value
				);
				if (payload.suggestedType) {
					return updatedValue.setIn(
						[payload.rowId, 'type'], payload.suggestedType.id
					);
				}

				return updatedValue;
			}
		case UPDATE_IDENTIFIER_TYPE:
			return state.setIn([payload.rowId, 'type'], payload.value);
		case REMOVE_IDENTIFIER_ROW:
			return state.delete(payload);

		// no default
	}
	return state;
}

export default reducer;
