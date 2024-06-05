import {Action} from '../interface/type';


export const ADD_EDITION_GROUP = 'ADD_EDITION_GROUP';
export const CLEAR_EDITION_GROUPS = 'CLEAR_EDITION_GROUPS';
const nextEditionGroupId = 0;

/**
 * Produces an action indicating that new edition group should be added in `EditionGroups`.
 *
 * @param {Object} value - New edition group state.
 * @returns {Action} The resulting ADD_EDITION_GROUP action.
 */
export function addEditionGroup(value = null):Action {
	return {
		payload: {id: `eg${nextEditionGroupId}`, value},
		type: ADD_EDITION_GROUP
	};
}

/**
 * Produces an action indicating that all edition groups should be removed from `EditionGroups`.
 *
 * @returns {Action} The resulting CLEAR_EDITION_GROUPS action.
 */
export function clearEditionGroups():Action {
	return {
		type: CLEAR_EDITION_GROUPS
	};
}
