import {ADD_WORK, REMOVE_WORK, TOGGLE_CHECK, UPDATE_WORK, UPDATE_WORKS} from './action';
import {Action, State} from '../interface/type';
import Immutable from 'immutable';


const initialState = {};

export default function reducer(state = Immutable.Map(initialState), {type, payload}:Action):State {
	switch (type) {
		case ADD_WORK:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case UPDATE_WORKS:
			return Immutable.fromJS(payload);
		case REMOVE_WORK:
			return state.delete(payload);
		case UPDATE_WORK:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case TOGGLE_CHECK:
			return state.setIn([payload, 'checked'], !state.getIn([payload.id, 'checked']));
		default:
			return state;
	}
}
