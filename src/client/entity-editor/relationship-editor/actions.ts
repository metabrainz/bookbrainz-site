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

import type {Relationship, Attribute as _Attribute} from './types';
import {arrayMove} from 'react-sortable-hoc';


export const SHOW_RELATIONSHIP_EDITOR = 'SHOW_RELATIONSHIP_EDITOR';
export const HIDE_RELATIONSHIP_EDITOR = 'HIDE_RELATIONSHIP_EDITOR';
export const ADD_RELATIONSHIP = 'ADD_RELATIONSHIP';
export const EDIT_RELATIONSHIP = 'EDIT_RELATIONSHIP';
export const REMOVE_RELATIONSHIP = 'REMOVE_RELATIONSHIP';
export const UNDO_LAST_SAVE = 'UNDO_LAST_SAVE';
export const SORT_ITEMS = 'SORT_ITEMS';

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

export function sortItems(oldIndex, newIndex):any {
	return (dispatch, getState) => {
		const state = getState();
		const relationships = state.get('relationshipSection').get('relationships');
		const relObject = relationships.toJS();
		const array = Object.entries(relObject);
		const sortedArray = arrayMove(array, oldIndex, newIndex);

		sortedArray.forEach((item: [string, Relationship], index: number) => {
			item[1].attribute.forEach((relationship: _Attribute) => {
				if (relationship.attributeType === 1) {
					relationship.value.textValue = `${index}`;
				}
			});
		});
		const sortedObject = Object.fromEntries(new Map([...sortedArray]));
		const payload = sortedObject;
		dispatch({payload, type: SORT_ITEMS});
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
