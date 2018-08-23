/*
 * Copyright (C) 2018  Ben Ockmore
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

// @flow

import type {Relationship} from './types';


export const SHOW_RELATIONSHIP_EDITOR = 'SHOW_RELATIONSHIP_EDITOR';
export const HIDE_RELATIONSHIP_EDITOR = 'HIDE_RELATIONSHIP_EDITOR';
export const SAVE_RELATIONSHIP = 'SAVE_RELATIONSHIP';
export const EDIT_RELATIONSHIP = 'EDIT_RELATIONSHIP';

export type Action = {
	type: string,
	payload?: mixed,
	metadata?: {
		debounce?: string
	}
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
export function saveRelationship(data: Relationship): Action {
	return {
		payload: {data, rowID: `n${nextRowID++}`},
		type: SAVE_RELATIONSHIP
	};
}

export function editRelationship(rowID: number): Action {
	return {
		payload: rowID,
		type: EDIT_RELATIONSHIP
	};
}
