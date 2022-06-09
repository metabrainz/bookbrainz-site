import {ADD_WORK} from './action';
import immutable from 'immutable';


const initialState = {};

export default function reducer(state = immutable.Map(initialState), {type, payload}) {
	switch (type) {
		case ADD_WORK:
			return state.set(payload.id, immutable.fromJS(payload.value));

		default:
			return state;
	}
}
