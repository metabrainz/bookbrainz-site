import {ADD_EDITION_GROUP, CLEAR_EDITION_GROUPS} from './action';
import Immutable from 'immutable';


export default function editionGroupsReducer(state = Immutable.Map({}), {type, payload}) {
	switch (type) {
		case ADD_EDITION_GROUP:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case CLEAR_EDITION_GROUPS:
			return Immutable.Map({});
		default:
			return state;
	}
}
