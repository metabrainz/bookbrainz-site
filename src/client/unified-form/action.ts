export const DUMP_EDITION = 'DUMP_EDITION';
export const LOAD_EDITION = 'LOAD_EDITION';

const nextEditionId = 0;
export function dumpEdition() {
	return {
		payload: {
			id: `n${nextEditionId}`,
			value: null
		},
		type: DUMP_EDITION
	};
}

export function loadEdition(editionId = 'n0') {
	return {
		payload: {
			id: editionId
		},
		type: LOAD_EDITION
	};
}
