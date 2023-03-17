import {Iterable} from 'immutable';


export type _Author = {

};

export type _AuthorType = {

};

export type _Gender = {

};

export type _IdentifierType = {
	id: number,
	label: string,
	validationRegex: string
};

export type _Language = {

};

export function isIterable<K, V>(testVal: any): testVal is Iterable<K, V> {
	return Iterable.isIterable(testVal);
}
