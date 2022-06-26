import {ADD_AUTHOR, ADD_PUBLISHER, CLEAR_AUTHOR, CLEAR_PUBLISHER, CLEAR_PUBLISHERS, UPDATE_ISBN_TYPE, UPDATE_ISBN_VALUE} from './action';
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
		case CLEAR_PUBLISHER:
			return state.delete(payload);
		case CLEAR_PUBLISHERS:
			return Immutable.Map({});
		default:
			return state;
	}
}

export function authorsReducer(state = Immutable.Map({}), {type, payload}) {
	switch (type) {
		case ADD_AUTHOR:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case CLEAR_AUTHOR:
			return state.delete(payload);
		default:
			return state;
	}
}
