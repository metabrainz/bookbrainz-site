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
	UPDATE_BEGIN_DATE, UPDATE_ENDED, UPDATE_END_DATE, UPDATE_GENDER, UPDATE_TYPE
} from './actions';
import Immutable from 'immutable';


function reducer(
	state = Immutable.Map({
		beginDate: '',
		endDate: '',
		ended: false,
		gender: null,
		type: null
	}),
	action
) {
	const {type, payload} = action;
	switch (type) {
		case UPDATE_GENDER:
			return state.set('gender', payload);
		case UPDATE_TYPE:
			return state.set('type', payload);
		case UPDATE_BEGIN_DATE:
			return state.set('beginDate', payload);
		case UPDATE_END_DATE:
			return state.set('endDate', payload);
		case UPDATE_ENDED:
			return state.set('ended', payload);
		// no default
	}
	return state;
}

export default reducer;
