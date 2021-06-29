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
	Action, UPDATE_ORDER_TYPE, UPDATE_SERIES_TYPE
} from './actions';


type State = Immutable.Map<string, any>;

function reducer(
	state: State = Immutable.Map({
		orderType: 1,
		seriesType: 'Author'
	}),
	action: Action
): State {
	const {type, payload} = action;
	switch (type) {
		case UPDATE_ORDER_TYPE:
			return state.set('orderType', payload);
		case UPDATE_SERIES_TYPE:
			return state.set('seriesType', payload);
		// no default
	}
	return state;
}

export default reducer;
