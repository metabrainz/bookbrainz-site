import {ADD_SERIES, ADD_WORK, REMOVE_SERIES, REMOVE_WORK, TOGGLE_COPY_AUTHOR_CREDITS, UPDATE_WORK, UPDATE_WORKS} from './action';
import {Action, State} from '../interface/type';
import Immutable from 'immutable';


const initialState = Immutable.Map({});

export function worksReducer(state = initialState, {type, payload}:Action):State {
	switch (type) {
		case ADD_WORK:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case UPDATE_WORKS:
			return Immutable.fromJS(payload);
		case REMOVE_WORK:
			return state.delete(payload);
		case UPDATE_WORK:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case TOGGLE_COPY_AUTHOR_CREDITS:
			return state.setIn([payload, 'checked'], !state.getIn([payload, 'checked']));
		default:
			return state;
	}
}

export function seriesReducer(state = initialState, {type, payload}:Action):State {
	switch (type) {
		case ADD_SERIES:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case REMOVE_SERIES:
			return state.delete(payload);
		default:
			return state;
	}
}
