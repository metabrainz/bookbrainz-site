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

import * as Immutable from 'immutable';
import {
	EDIT_RELATIONSHIP, HIDE_RELATIONSHIP_EDITOR, SAVE_RELATIONSHIP,
	SHOW_RELATIONSHIP_EDITOR
} from './actions';


function reducer(
	state = Immutable.Map({
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: Immutable.OrderedMap()
	}),
	action
) {
	switch (action.type) {
		case SHOW_RELATIONSHIP_EDITOR:
			return state.set('relationshipEditorVisible', true)
				.set('relationshipEditorProps', null);
		case HIDE_RELATIONSHIP_EDITOR:
			return state.set('relationshipEditorVisible', false);
		case SAVE_RELATIONSHIP: {
			const rowID = state.getIn(
				['relationshipEditorProps', 'rowID'],
				action.payload.rowID
			);
			return state.setIn(
				['relationships', rowID],
				Immutable.fromJS({rowID, ...action.payload.data})
			)
				.set('relationshipEditorProps', null)
				.set('relationshipEditorVisible', false);
		}
		case EDIT_RELATIONSHIP:
			return state.set(
				'relationshipEditorProps',
				state.getIn(['relationships', action.payload])
			).set('relationshipEditorVisible', true);
		// no default
	}
	return state;
}

export default reducer;
