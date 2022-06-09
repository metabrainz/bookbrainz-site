

export const ADD_WORK = 'ADD_WORK';

let nextId = 0;
export function updateWorks(payload) {
	return {
		payload: {id: nextId++, value: payload},
		type: ADD_WORK
	};
}
