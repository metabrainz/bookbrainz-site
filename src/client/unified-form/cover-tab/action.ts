import {Action} from '../interface/type';


export const UPDATE_ISBN_VALUE = 'UPDATE_ISBN_VALUE';
export const ADD_AUTHOR = 'ADD_AUTHOR';
export const UPDATE_ISBN_TYPE = 'UPDATE_ISBN_TYPE';
export const ADD_PUBLISHER = 'ADD_PUBLISHER';
export const CLEAR_PUBLISHER = 'CLEAR_PUBLISHER';
export const CLEAR_PUBLISHERS = 'CLEAR_PUBLISHERS';
export const CLEAR_AUTHOR = 'CLEAR_AUTHOR';
export const AUTO_ISBN = 'AUTO_ISBN';

let nextPublisherId = 0;
let nextAuthorId = 0;

/**
 * Produces an action indicating that new Publisher should be added in `Publishers`.
 *
 * @param {Object} value - New publisher state.
 * @returns {Action} The resulting ADD_PUBLISHER action.
 */
export function addPublisher(value = null):Action {
	return {
		payload: {id: `p${nextPublisherId++}`, value},
		type: ADD_PUBLISHER
	};
}

/**
 * Produces an action indicating that newly created
 * Publisher should be removed from `Publishers`.
 *
 * @param {string} pid - Publisher id to be removed.
 * @returns {Action} The resulting CLEAR_PUBLISHER action.
 */
export function clearPublisher(pid:string):Action {
	return {
		payload: pid,
		type: CLEAR_PUBLISHER
	};
}

/**
 * Produces an action indicating that all Publishers should be removed from `Publishers`.
 *
 * @returns {Action} The resulting CLEAR_PUBLISHERS action.
 */
export function clearPublishers():Action {
	return {
		type: CLEAR_PUBLISHERS
	};
}

/**
 * Produces an action indicating that newly created
 * Author should be removed from `Authors`.
 *
 * @param {string}aid - Author id to be removed.
 * @returns {Action} The resulting CLEAR_AUTHOR action.
 */
export function clearAuthor(aid:string):Action {
	return {
		payload: aid,
		type: CLEAR_AUTHOR
	};
}

/**
 * Produces an action indicating that new Author should be added in `Authors`
 * as well as in AC of Edition.
 *
 * @param {object} value - New author credit state.
 * @param {string} rowId - Row id of author credit editor.
 * @returns {Action} The resulting ADD_AUTHOR action.
 */
export function addAuthor(value = null, rowId:string):Action {
	return {
		payload: {id: `a${nextAuthorId++}`, rowId, value},
		type: ADD_AUTHOR
	};
}

/**
 * Produces an action indicating that `ISBN` value should be updated.
 *
 * @param {string} newValue - New value of ISBN Field.
 * @returns {Action} The resulting UPDATE_ISBN_VALUE action.
 */
export function debouncedUpdateISBNValue(newValue: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newValue,
		type: UPDATE_ISBN_VALUE
	};
}

/**
 * Produces an action indicating that `ISBN` type should be updated.
 *
 * @param {number} typeId - Type of corresponding ISBN value.
 * @returns {Action} The resulting UPDATE_ISBN_TYPE action.
 */
export function updateISBNType(typeId:number) {
	return {
		payload: typeId,
		type: UPDATE_ISBN_TYPE
	};
}

/**
 * Produces an action indicating that `autoISBN` value should be updated.
 *
 * @param {boolean} value - New value for autoISBN.
 * @returns {Action} The resulting AUTO_ISBN action.
 */
export function updateAutoISBN(value:boolean):Action {
	return {
		payload: value,
		type: AUTO_ISBN
	};
}
