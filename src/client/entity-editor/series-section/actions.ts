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


import type {Attribute, Relationship} from '../relationship-editor/types';


export const UPDATE_ORDER_TYPE = 'UPDATE_ORDER_TYPE';
export const UPDATE_SERIES_TYPE = 'UPDATE_SERIES_TYPE';
export const ADD_SERIES_ITEM = 'ADD_SERIES_ITEM';
export const EDIT_SERIES_ITEM = 'EDIT_SERIES_ITEM';
export const REMOVE_SERIES_ITEM = 'REMOVE_SERIES_ITEM';
export type Action = {
	type: string,
	payload: {
		data?: any,
		rowID?: string,
		seriesType?: string,
		newType?: number,
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
 * @returns {Action} The resulting ADD_SERIES_ITEM action.
 */
export function addSeriesItem(data: Relationship): Action {
	return {
		payload: {data, rowID: `n${nextRowID++}`},
		type: ADD_SERIES_ITEM
	};
}