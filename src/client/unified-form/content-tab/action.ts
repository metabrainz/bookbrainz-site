import {size} from 'lodash';


export const ADD_WORK = 'ADD_WORK';
export const UPDATE_WORKS = 'UPDATE_WORKS';

let nextWorkId = 0;
export function addWork(value = null) {
	return {
		payload: {id: nextWorkId++, value},
		type: ADD_WORK
	};
}

export function updateWorks(newWorks) {
	nextWorkId = size(newWorks);
	return {
		payload: newWorks,
		type: UPDATE_WORKS
	};
}
