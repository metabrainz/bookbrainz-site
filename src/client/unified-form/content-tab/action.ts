

export const UPDATE_WORKS = 'UPDATE_WORKS';

export function updateWorks(payload) {
	return {
		payload,
		type: UPDATE_WORKS
	};
}
