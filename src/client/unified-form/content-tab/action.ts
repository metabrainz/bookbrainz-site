import {Action} from '../interface/type';

// Work Actions
export const ADD_WORK = 'ADD_WORK';
export const UPDATE_WORKS = 'UPDATE_WORKS';
export const REMOVE_WORK = 'REMOVE_WORK';
export const UPDATE_WORK = 'UPDATE_WORK';
export const TOGGLE_CHECK = 'TOGGLE_CHECK';
export const COPY_WORK = 'COPY_WORK';
// Series Actions
export const ADD_SERIES = 'ADD_SERIES';

let nextWorkId = 0;
const nextSeriesId = 0;

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
 * Produces an action indicating that a Work should be removed from `Works`.
 *
 * @param {string} id - id of the work to be removed
 * @returns {Action} The resulting REMOVE_WORK action.
 */
export function removeWork(id:string):Action {
	return {
		payload: id,
		type: REMOVE_WORK
	};
}

/**
 * Produces an action indicating that a Work should be updated in `Works`.
 *
 * @param {string} id - id of work to be updated
 * @param {Object} value - updated work state.
 * @returns {Action} The resulting UPDATE_WORK action.
 */
export function updateWork(id:string, value):Action {
	return {
		payload: {id, value},
		type: UPDATE_WORK
	};
}

/**
 * Produces an action indicating that a Work's checkbox should be toggled in `Works`.
 *
 * @param {string} id - id of the work to be toggle
 * @returns {Action} The resulting TOGGLE_CHECK action.
 */
export function toggleCheck(id:string):Action {
	return {
		payload: id,
		type: TOGGLE_CHECK
	};
}

/**
 * Produces an action indicating that a Work need to be copied.
 *
 * @param {string} id - id of the work to be copied
 * @returns {Action} The resulting COPY_WORK action.
 */
export function copyWork(id:string):Action {
	return {
		payload: id,
		type: COPY_WORK
	};
}

/**
 * Produces an action indicating that new Series should be added in `Series`.
 *
 * @param {object} value - New series state.
 * @returns {Action} The resulting ADD_SERIES action.
 */
export function addSeries(value = null):Action {
	return {
		payload: {id: `s${nextSeriesId}`, value},
		type: ADD_SERIES
	};
}
