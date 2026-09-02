import {ADD_EDITION_GROUP, CLEAR_EDITION_GROUPS} from './action';
import {Map as ImmutableMap, fromJS} from 'immutable';


export default function editionGroupsReducer(state = ImmutableMap({}), {type, payload}) {
	switch (type) {
		case ADD_EDITION_GROUP:
			return state.set(payload.id, fromJS(payload.value));
		case CLEAR_EDITION_GROUPS:
			return ImmutableMap({});
		default:
			return state;
	}
}
