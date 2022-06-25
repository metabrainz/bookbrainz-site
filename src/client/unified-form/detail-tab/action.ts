import {Action} from '../interface/type';


export const ADD_EDITION_GROUP = 'ADD_EDITION_GROUP';
export const CLEAR_EDITION_GROUPS = 'CLEAR_EDITION_GROUPS';
const nextEditionGroupId = 0;
export function addEditionGroup(value = null):Action {
	return {
		payload: {id: `eg${nextEditionGroupId}`, value},
		type: ADD_EDITION_GROUP
	};
}

export function clearEditionGroups():Action {
	return {
		type: CLEAR_EDITION_GROUPS
	};
}
