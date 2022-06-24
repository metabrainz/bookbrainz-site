export const DUMP_EDITION = 'DUMP_EDITION';
export const LOAD_EDITION = 'LOAD_EDITION';

const nextEditionId = 0;
export function dumpEdition(type?:string) {
	return {
		payload: {
			id: `e${nextEditionId}`,
			type,
			value: null
		},
		type: DUMP_EDITION
	};
}

export function loadEdition(editionId = 'e0') {
	return {
		payload: {
			id: editionId
		},
		type: LOAD_EDITION
	};
}
