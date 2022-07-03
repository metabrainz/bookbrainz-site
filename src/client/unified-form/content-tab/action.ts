import {Action} from '../interface/type';
import {size} from 'lodash';


export const ADD_WORK = 'ADD_WORK';
export const UPDATE_WORKS = 'UPDATE_WORKS';

let nextWorkId = 0;

/**
 * Produces an action indicating that new Work should be added in `Works`.
 *
 * @param {Object} value - New work state.
 * @returns {Action} The resulting ADD_WORK action.
 */
export function addWork(value = null):Action {
	return {
		payload: {id: `w${nextWorkId++}`, value},
		type: ADD_WORK
	};
}

/**
 * Produces an action indicating that `Works` state should be updated.
 *
 * @param {Object} works - All Works.
 * @returns {Action} The resulting UPDATE_WORKS action.
 */
export function updateWorks(works:Record<string, any>):Action {
	nextWorkId = size(works);
	return {
		payload: works,
		type: UPDATE_WORKS
	};
}
