/*
 * Copyright (C) 2021  Akash Gupta
 *
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

import type {Attribute, Relationship, RelationshipForDisplay} from '../relationship-editor/types';
import {attachAttribToRelForDisplay} from '../helpers';
import {sortRelationshipOrdinal} from '../../../common/helpers/utils';


export const UPDATE_ORDER_TYPE = 'UPDATE_ORDER_TYPE';
export const UPDATE_SERIES_TYPE = 'UPDATE_SERIES_TYPE';
export const ADD_SERIES_ITEM = 'ADD_SERIES_ITEM';
export const EDIT_SERIES_ITEM = 'EDIT_SERIES_ITEM';
export const REMOVE_SERIES_ITEM = 'REMOVE_SERIES_ITEM';
export const SORT_SERIES_ITEM = 'SORT_SERIES_ITEM';
export const REMOVE_ALL_SERIES_ITEMS = 'REMOVE_ALL_SERIES_ITEMS';
export const ADD_BULK_SERIES_ITEMS = 'ADD_BULK_SERIES_ITEMS';

export type Action = {
	type: string,
	payload: {
		data?: any,
		rowID?: string,
		seriesType?: string,
		newType?: number,
		nextRowID?:string
	}
};


/**
 * Produces an action indicating that the series type for the series being
 * edited should be updated with the provided value.
 *
 * @param {number} seriesType - The new value to be used for the series type ID.
 * @returns {Action} The resulting UPDATE_SERIES_TYPE action.
 */

export function updateSeriesType(seriesType: string): Action {
	return {
		payload: {seriesType},
		type: UPDATE_SERIES_TYPE
	};
}

/**
 * Produces an action indicating that the ordering type for the series being
 * edited should be updated with the provided value.
 *
 * @param {number} newType - The new value to be used for the series type ID.
 * @returns {Action} The resulting UPDATE_ORDER_TYPE action.
 */
export function updateOrderType(newType: number | null | undefined): Action {
	return {
		payload: {newType},
		type: UPDATE_ORDER_TYPE
	};
}

let nextRowID = 0;

/**
 * Produces an action indicating that a row for a new series item should be added
 * to the series section. The row is assigned an ID based on an incrementing
 * variable existing on the client.
 * @param {Relationship} data - The new entity to be added in the list.
 * @param {string} rowID - The rowID of the new entity to be added in the list.
 * @returns {Action} The resulting ADD_SERIES_ITEM action.
 */
export function addSeriesItem(data: Relationship, rowID?:string): Action {
	return {
		payload: {data, rowID: rowID ?? `n${nextRowID++}`},
		type: ADD_SERIES_ITEM
	};
}


/**
 * This action creator first sorts the series items object and then pass the
 * sorted object in the payload while dispatching the action.
 *
 * @param {number} oldIndex - Old Position of the series item.
 * @param {number} newIndex - New Position of the series item.
 * @returns {void}
 */
export function sortSeriesItems(oldIndex, newIndex):any {
	return (dispatch, getState) => {
		const state = getState();
		const seriesItems = state.get('seriesSection').get('seriesItems');
		const orderTypeValue = state.get('seriesSection').get('orderType');
		const seriesItemsObject = seriesItems.toJS();
		const seriesItemsArray: RelationshipForDisplay[] = Object.values(seriesItemsObject);
		// Attach the deeply nested attributes to the first level of the each seriesItem object.
		attachAttribToRelForDisplay(seriesItemsArray);
		if (orderTypeValue === 1) { // OrderType 1 for Automatic Ordering
			seriesItemsArray.sort(sortRelationshipOrdinal('number')); // sorts the array of series items on number attribute
		}
		else {
		    seriesItemsArray.sort(sortRelationshipOrdinal('position')); // sorts the array of series items on position attribute
		}
		// Before saving the seriesItems to the store, we need to detach back the attributes from each seriesItem object.
		seriesItemsArray.forEach((seriesItem: any) => {
			delete seriesItem.number;
			delete seriesItem.position;
		});
		const sortedSeriesItems = [...seriesItemsArray];
		const [itemToMove] = sortedSeriesItems.splice(oldIndex, 1);
		sortedSeriesItems.splice(newIndex, 0, itemToMove);
		sortedSeriesItems.forEach((seriesItem: RelationshipForDisplay, index: number) => {
			seriesItem.attributes.forEach((attribute: Attribute) => {
				if (attribute.attributeType === 1) { // Attribute type 1 for position
					attribute.value.textValue = `${index}`; // assigns the position value to the sorted series item array
				}
			});
		});
		const payload = sortedSeriesItems.reduce((accumulator, rel: RelationshipForDisplay) => {
			accumulator[rel.rowID] = rel;
			return accumulator;
		}, {});
		dispatch({payload, type: SORT_SERIES_ITEM});
	  };
}

/**
 * Produces an action indicating that the attribute value of the entity being
 * edited should be updated with the provided value.
 *
 * @param {Attribute} data - The new attribute value to be used for the entity.
 * @param {string} rowID - The ID of the series item that is being edited.
 * @returns {Action} The resulting EDIT_SERIES_ITEM action.
 */
export function editSeriesItem(data: Attribute, rowID: string): Action {
	return {
		payload: {data, nextRowID: `n${nextRowID++}`, rowID},
		type: EDIT_SERIES_ITEM
	};
}

/**
 * Produces an action indicating that the series item with the provided ID should be
 * removed.
 * @param {string} rowID - The ID of the series item that is being removed.
 * @returns {Action} The resulting REMOVE_SERIES_ITEM action.
 */
export function removeSeriesItem(rowID: string): Action {
	return {
		payload: {rowID},
		type: REMOVE_SERIES_ITEM
	};
}

/**
 * Produces an action indicating that all series items should be removed.
 *
 * @returns {Action} The resulting REMOVE_ALL_SERIES_ITEMS action.
 */
export function removeAllSeriesItems(): Action {
	return {
		payload: {},
		type: REMOVE_ALL_SERIES_ITEMS
	};
}

/**
 * Produces an action indicating that the new series items should replace the old one.
 *
 * @param {Object} seriesItems - The series items object to be added.
 * @returns {Action} The resulting ADD_BULK_SERIES_ITEMS action.
 */

export function addBulkSeriesItems(seriesItems: Record<string, string>): Action {
	return {
		payload: seriesItems,
		type: ADD_BULK_SERIES_ITEMS
	};
}
