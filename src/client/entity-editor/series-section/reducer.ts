/*
 * Copyright (C) 2021  Akash Gupta
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
	ADD_SERIES_ITEM, Action, EDIT_SERIES_ITEM, REMOVE_SERIES_ITEM,
	SORT_SERIES_ITEM, UPDATE_ORDER_TYPE, UPDATE_SERIES_TYPE
} from './actions';


type State = Immutable.Map<string, any>;

function reducer(
	state: State = Immutable.Map({
		orderType: 1,
		seriesItems: Immutable.OrderedMap(),
		seriesType: 'Work'
	}),
	action: Action
): State {
	const {type, payload} = action;
	switch (type) {
		case UPDATE_ORDER_TYPE:
			return state.set('orderType', payload.newType);
		case UPDATE_SERIES_TYPE:
			return state.set('seriesType', payload.seriesType);
		case ADD_SERIES_ITEM: {
			const {rowID} = payload;
			return state.setIn(
				['seriesItems', rowID],
				Immutable.fromJS({rowID, ...payload.data})
			);
		}
		case SORT_SERIES_ITEM:
			return state.set('seriesItems', Immutable.fromJS(action.payload));
		case EDIT_SERIES_ITEM: {
			// index of number attribute in the attributes array
			const index = state.getIn(['seriesItems', payload.rowID, 'attributes']).findIndex(attribute => attribute.get('attributeType') === 2);
			return state.setIn(
				['seriesItems', payload.rowID, 'attributes', index],
				Immutable.fromJS({...payload.data})
			);
		}
		case REMOVE_SERIES_ITEM:
			return state.deleteIn(['seriesItems', payload.rowID]);
		// no default
	}
	return state;
}

export default reducer;
