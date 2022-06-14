import {ADD_PUBLISHER, UPDATE_ISBN_TYPE, UPDATE_ISBN_VALUE} from './action';
import Immutable from 'immutable';


export function ISBNReducer(state = Immutable.Map({
	type: null,
	value: ''
}), action) {
	const {payload, type} = action;
	switch (type) {
		case UPDATE_ISBN_TYPE:
			return state.set('type', payload);
		case UPDATE_ISBN_VALUE:
			return state.set('value', payload);
		default:
			return state;
	}
}

export function publishersReducer(state = Immutable.Map({}), {type, payload}) {
	switch (type) {
		case ADD_PUBLISHER:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		default:
			return state;
	}
}
