import {UPDATE_WORKS} from './action';
import immutable from 'immutable';


const initialState = {};

export default function reducer(state = immutable.Map(initialState), {type, payload}) {
	switch (type) {
		case UPDATE_WORKS:
			return immutable.fromJS(payload);

		default:
			return state;
	}
}
