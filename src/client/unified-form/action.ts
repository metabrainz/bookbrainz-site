import {Action} from './interface/type';


export const DUMP_EDITION = 'DUMP_EDITION';
export const LOAD_EDITION = 'LOAD_EDITION';
export const OPEN_ENTITY_MODAL = 'OPEN_ENTITY_MODAL';
export const CLOSE_ENTITY_MODAL = 'CLOSE_ENTITY_MODAL';

const nextEditionId = 0;

/**
 * Produces an action indicating that current edition state should be saved in `Editions`.
 *
 * @param {string} type - type of new entity which caused dump
 * @returns {Action} The resulting DUMP_EDITION action.
 */
export function dumpEdition(type?:string):Action {
	return {
		payload: {
			id: `e${nextEditionId}`,
			type,
			value: null
		},
		type: DUMP_EDITION
	};
}

/**
 * Produces an action indicating that particular edition state having that id
 * should be loaded from `Editions`.
 *
 * @param {string} editionId - id of edition to load
 * @returns {Action} The resulting LOAD_EDITION action.
 */
export function loadEdition(editionId = 'e0'):Action {
	return {
		payload: {
			id: editionId
		},
		type: LOAD_EDITION
	};
}

/**
 * Set entity modal state to open
 *
 * @returns {Action} The resulting OPEN_ENTITY_MODAL action.
 */
export function openEntityModal():Action {
	return {
		type: OPEN_ENTITY_MODAL
	};
}

/**
 * Set entity modal state to close
 *
 * @returns {Action} The resulting CLOSE_ENTITY_MODAL action.
 */
export function closeEntityModal():Action {
	return {
		type: CLOSE_ENTITY_MODAL
	};
}
