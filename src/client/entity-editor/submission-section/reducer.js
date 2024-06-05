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
	SET_SUBMITTED, SET_SUBMIT_ERROR, UPDATE_REVISION_NOTE
} from './actions';
import Immutable from 'immutable';


function reducer(
	state = Immutable.Map({
		note: '',
		submitError: '',
		submitted: false
	}),
	action
) {
	switch (action.type) {
		case UPDATE_REVISION_NOTE:
			return state.set('note', action.value);
		case SET_SUBMIT_ERROR:
			return state.set('submitError', action.error);
		case SET_SUBMITTED:
			return state.set('submitted', action.submitted);
		// no default
	}
	return state;
}

export default reducer;
