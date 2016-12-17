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

import {HIDE_ALIAS_EDITOR} from '../alias-editor/actions';
import {HIDE_IDENTIFIER_EDITOR} from '../identifier-editor/actions';
import Immutable from 'immutable';

function reducer(
	state = Immutable.Map({
		name: '',
		sortName: '',
		language: null,
		disambiguationVisible: false,
		aliasEditorVisible: false
	}),
	action
) {
	switch (action.type) {
		case 'UPDATE_NAME_FIELD':
			return state.set('name', action.value);
		case 'UPDATE_SORT_NAME_FIELD':
			return state.set('sortName', action.value);
		case 'UPDATE_LANGUAGE_FIELD':
			return state.set('language', action.value);
		case 'SHOW_DISAMBIGUATION':
			return state.set('disambiguationVisible', true);
		case 'SHOW_ALIAS_EDITOR':
			return state.set('aliasEditorVisible', true);
		case HIDE_ALIAS_EDITOR:
			return state.set('aliasEditorVisible', false);
		case 'SHOW_IDENTIFIER_EDITOR':
			return state.set('identifierEditorVisible', true);
		case HIDE_IDENTIFIER_EDITOR:
			return state.set('identifierEditorVisible', false);
		case 'UPDATE_DISAMBIGUATION_FIELD':
			return state.set('disambiguation', action.value);
		// no default
	}
	return state;
}

export default reducer;
