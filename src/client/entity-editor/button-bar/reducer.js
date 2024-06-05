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

import {
	SHOW_ALIAS_EDITOR, SHOW_IDENTIFIER_EDITOR
} from './actions';
import {HIDE_ALIAS_EDITOR} from '../alias-editor/actions';
import {HIDE_IDENTIFIER_EDITOR} from '../identifier-editor/actions';
import Immutable from 'immutable';


function reducer(
	state = Immutable.Map({
		aliasEditorVisible: false,
		identifierEditorVisible: false
	}),
	action
) {
	switch (action.type) {
		case SHOW_ALIAS_EDITOR:
			return state.set('aliasEditorVisible', true);
		case HIDE_ALIAS_EDITOR:
			return state.set('aliasEditorVisible', false);
		case SHOW_IDENTIFIER_EDITOR:
			return state.set('identifierEditorVisible', true);
		case HIDE_IDENTIFIER_EDITOR:
			return state.set('identifierEditorVisible', false);
		// no default
	}
	return state;
}

export default reducer;
