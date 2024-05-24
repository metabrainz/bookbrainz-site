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

import * as Immutable from 'immutable';
import {
	ADD_IDENTIFIER,
	ADD_OTHER_ISBN, REMOVE_EMPTY_IDENTIFIERS, REMOVE_IDENTIFIER_ROW,
	UPDATE_IDENTIFIER_TYPE, UPDATE_IDENTIFIER_VALUE
} from './actions';


type State = Immutable.OrderedMap<string, any>;

function reducer(
	state: State = Immutable.OrderedMap(),
	action
) {
	const {type, payload} = action;
	switch (type) {
		case ADD_IDENTIFIER: {
			const IDENTIFIER_DATA = Immutable.Map(payload.data);
			const newIdentifier = state.set(payload.rowId, IDENTIFIER_DATA);

			// don't switch type if user already selected it
			if (payload.suggestedType && !state.getIn([payload.rowId, 'type'])) {
				return newIdentifier.setIn(
					[payload.rowId, 'type'], payload.suggestedType.id
				);
			}

			return newIdentifier;
		}
		case UPDATE_IDENTIFIER_VALUE:
		{
			const updatedValue = state.setIn(
				[payload.rowId, 'value'], payload.value
			);
			// don't switch type if user already selected it
			if (payload.suggestedType && !state.getIn([payload.rowId, 'type'])) {
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
		case REMOVE_EMPTY_IDENTIFIERS:
			return state.filterNot(identifier =>
				identifier.value === '' && identifier.type === null);
		case ADD_OTHER_ISBN: {
			const {rowId, value, type: typeId} = payload;
			// search if given identifier already exists
			const existingIdentifierKey = state.findKey((row) => row.get('type') === typeId);
			if (!existingIdentifierKey) {
				return state.set(rowId, Immutable.Map({
					type: typeId,
					value
				}));
			}
			// override the existing one if user enter different ISBN
			return state.setIn([existingIdentifierKey, 'value'], value);
		}
		// no default
	}
	return state;
}

export default reducer;
