import {Action} from '../interface/type';


export const UPDATE_ISBN_VALUE = 'UPDATE_ISBN_VALUE';
export const UPDATE_ISBN_TYPE = 'UPDATE_ISBN_TYPE';
export const ADD_PUBLISHER = 'ADD_PUBLISHER';


let nextPublisherId = 0;
export function addPublisher(value = null):Action {
	return {
		payload: {id: `p${nextPublisherId++}`, value},
		type: ADD_PUBLISHER
	};
}


export function debouncedUpdateISBNValue(newValue: string): Action {
	return {
		meta: {debounce: 'keystroke'},
		payload: newValue,
		type: UPDATE_ISBN_VALUE
	};
}

export function updateISBNType(typeId:number) {
	return {
		payload: typeId,
		type: UPDATE_ISBN_TYPE
	};
}
