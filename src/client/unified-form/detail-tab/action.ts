import {Action} from '../interface/type';


export const ADD_EDITION_GROUP = 'ADD_EDITION_GROUP';
let nextEditionGroupId = 0;
export function addEditionGroup(value = null):Action {
	return {
		payload: {id: `n${nextEditionGroupId++}`, value},
		type: ADD_EDITION_GROUP
	};
}
