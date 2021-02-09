/*
 * Copyright (C) 2016  Ben Ockmore
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

export const SHOW_ALIAS_EDITOR = 'SHOW_ALIAS_EDITOR';
export const SHOW_IDENTIFIER_EDITOR = 'SHOW_IDENTIFIER_EDITOR';

export type Action = {
	type: string,
	payload?: unknown,
	meta?: {
		debounce?: string
	}
};

/**
 * Produces an action indicating that the alias editor should be made visible.
 *
 * @see hideAliasEditor
 *
 * @returns {Action} The resulting SHOW_ALIAS_EDITOR action.
 */
export function showAliasEditor(): Action {
	return {
		type: SHOW_ALIAS_EDITOR
	};
}

/**
 * Produces an action indicating that the identifier editor should be made
 * visible.
 *
 * @see hideIdentifierEditor
 *
 * @returns {Action} The resulting SHOW_IDENTIFIER_EDITOR action.
 */
export function showIdentifierEditor(): Action {
	return {
		type: SHOW_IDENTIFIER_EDITOR
	};
}
