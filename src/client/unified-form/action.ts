import {Action} from './interface/type';


export const DUMP_EDITION = 'DUMP_EDITION';
export const LOAD_EDITION = 'LOAD_EDITION';

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
