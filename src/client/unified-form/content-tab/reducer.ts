import {ADD_WORK, UPDATE_WORKS} from './action';
import Immutable from 'immutable';


const initialState = {};

export default function reducer(state = Immutable.Map(initialState), {type, payload}) {
	switch (type) {
		case ADD_WORK:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case UPDATE_WORKS:
			return Immutable.fromJS(payload);
		default:
			return state;
	}
}