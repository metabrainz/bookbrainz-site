/*
 * Copyright (C) 2018  Ben Ockmore
 *				 2021  Akash Gupta
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
/* eslint-disable no-inline-comments */

import type {Relationship, Attribute as _Attribute} from './types';
import arrayMove from 'array-move';
import {sortRelationshipOrdinal} from '../../../common/helpers/utils';


export const SHOW_RELATIONSHIP_EDITOR = 'SHOW_RELATIONSHIP_EDITOR';
export const HIDE_RELATIONSHIP_EDITOR = 'HIDE_RELATIONSHIP_EDITOR';
export const ADD_RELATIONSHIP = 'ADD_RELATIONSHIP';
export const EDIT_RELATIONSHIP = 'EDIT_RELATIONSHIP';
export const REMOVE_RELATIONSHIP = 'REMOVE_RELATIONSHIP';
export const UNDO_LAST_SAVE = 'UNDO_LAST_SAVE';
export const SORT_RELATIONSHIPS = 'SORT_RELATIONSHIPS';

export type Action = {
	type: string,
	payload?: unknown
};

export function showRelationshipEditor(): Action {
	return {
		type: SHOW_RELATIONSHIP_EDITOR
	};
}

export function hideRelationshipEditor(): Action {
	return {
		type: HIDE_RELATIONSHIP_EDITOR
	};
}

let nextRowID = 0;
export function addRelationship(data: Relationship): Action {
	return {
		payload: {data, rowID: `n${nextRowID++}`},
		type: ADD_RELATIONSHIP
	};
}

/**
 * This action creator first sorts the relationship object and then pass the
 * sorted object in the payload while dispatching the action.
 *
 * @param {number} oldIndex - Old Position of the relationship.
 * @param {number} newIndex - New Position of the relationship.
 * @returns {void}
 */
export function sortRelationships(oldIndex, newIndex):any {
	return (dispatch, getState) => {
		const state = getState();
		const relationships = state.get('relationshipSection').get('relationships');
		const orderTypeValue = state.get('seriesSection').get('orderType');
		const relObject = relationships.toJS();
		const relArray = Object.entries(relObject);
		const automaticSort = [];
		let automaticSortedArr: [string, Relationship][]; // stores the sorted array of relationships(sorting performed on number)

		if (orderTypeValue === 1) { // OrderType 1 for Automatic Ordering
			relArray.forEach((relationship:[string, Relationship]) => {
				relationship[1].attributes.forEach((attribute:_Attribute) => {
					if (attribute.attributeType === 2) { // Attribute Type 2 for number
						automaticSort.push({number: attribute.value.textValue, relationship});
					}
				});
			});
			automaticSort.sort(sortRelationshipOrdinal('number')); // sorts the array of relationships on number attribute
			automaticSortedArr = automaticSort.map(item => item.relationship);
		}

		// eslint-disable-next-line max-len
		const sortedRelationships = orderTypeValue === 1 ? arrayMove(automaticSortedArr, oldIndex, newIndex) : arrayMove(relArray, oldIndex, newIndex);

		sortedRelationships.forEach((relationship: [string, Relationship], index: number) => {
			relationship[1].attributes.forEach((attribute: _Attribute) => {
				if (attribute.attributeType === 1) { // Attribute type 1 for position
					attribute.value.textValue = `${index}`; // assigns the position value to the sorted relationship array
				}
			});
		});

		const sortedRelationshipObject = Object.fromEntries(new Map([...sortedRelationships]));
		const payload = sortedRelationshipObject;
		dispatch({payload, type: SORT_RELATIONSHIPS});
	  };
}

export function editRelationship(rowID: number): Action {
	return {
		payload: rowID,
		type: EDIT_RELATIONSHIP
	};
}

export function removeRelationship(rowID: number): Action {
	return {
		payload: rowID,
		type: REMOVE_RELATIONSHIP
	};
}

export function undoLastSave(): Action {
	return {
		type: UNDO_LAST_SAVE
	};
}
