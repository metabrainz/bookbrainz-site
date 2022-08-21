import {ADD_SERIES, ADD_WORK, REMOVE_WORK, TOGGLE_COPY_AUTHOR_CREDITS, UPDATE_WORK, UPDATE_WORKS, UPDATE_WORK_ID} from './action';
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
		case UPDATE_WORK_ID:
			return state.setIn([payload.oldId, 'id'], payload.newId);
		default:
			return state;
	}
}

export function seriesReducer(state = initialState, {type, payload}:Action):State {
	switch (type) {
		case ADD_SERIES:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		default:
			return state;
	}
}
