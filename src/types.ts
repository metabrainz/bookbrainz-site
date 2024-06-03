import {Iterable} from 'immutable';


export type _Author = {

};

export type _AuthorType = {

};

export type _Editor = {
	activeAt: string,
	areaId: number,
	bio: string,
	cachedMetabrainzName: string,
	createdAt: string,
	genderId: number,
	id: number,
	metabrainzUserId: number,
	name: string,
	reputation: number,
	revisionsApplied: number,
	revisionsReverted: number,
	titleUnlockId: null,
	totalRevisions: 65302,
	typeId: 1,
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
