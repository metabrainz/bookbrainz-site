import {UPDATE_ISBN_TYPE, UPDATE_ISBN_VALUE} from './action';
import {Map as immutableMap} from 'immutable';


export default function reducer(state = immutableMap({
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
