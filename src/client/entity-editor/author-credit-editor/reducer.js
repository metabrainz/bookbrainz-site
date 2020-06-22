/*
 * Copyright (C) 2020  Sean Burke
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
	ADD_AUTHOR_CREDIT_ROW, REMOVE_AUTHOR_CREDIT_ROW,
	UPDATE_CREDIT_AUTHOR_VALUE, UPDATE_CREDIT_DISPLAY_VALUE,
	UPDATE_CREDIT_JOIN_PHRASE_VALUE
} from './actions';
import Immutable from 'immutable';


const EMPTY_CREDIT_ROW = Immutable.Map({
	author: null,
	joinPhrase: '',
	name: ''
});

function addAuthorCreditRow(state, payload) {
	let stateToModify = state;

	// If there are already names in the author credit and the previous name
	// has no join phrase set, set a default.
	const lastKey = stateToModify.keySeq().last();
	if (lastKey && stateToModify.getIn([lastKey, 'joinPhrase'], '') === '') {
		stateToModify = stateToModify.setIn([lastKey, 'joinPhrase'], ' & ');
	}

	return stateToModify.set(payload, EMPTY_CREDIT_ROW);
}

function setNewAuthorAndDisplay(state, payload) {
	let returnState = state.setIn([payload.rowId, 'author'], Immutable.fromJS(payload));

	if (!payload.id) {
		// If the user has emptied the author field, also empty the display
		// name.
		returnState = returnState.setIn([payload.rowId, 'name'], '');
	}
	else if (returnState.getIn([payload.rowId, 'name'], '') === '') {
		// When the display name is empty and the user sets a new author, copy
		// the author's name to the display name field.
		returnState = returnState.setIn([payload.rowId, 'name'], payload.text);
	}

	return returnState;
}

function deleteAuthorCreditRow(state, payload) {
	let returnState = state.delete(payload);

	// If names remain in the author credit, empty the join phrase for the last
	// name.
	const lastKey = returnState.keySeq().last();
	if (lastKey) {
		returnState = returnState.setIn([lastKey, 'joinPhrase'], '');
	}

	return returnState;
}

function reducer(
	state = Immutable.OrderedMap(),
	action
) {
	const {type, payload} = action;
	switch (type) {
		case ADD_AUTHOR_CREDIT_ROW:
			return addAuthorCreditRow(state, payload);
		case UPDATE_CREDIT_AUTHOR_VALUE:
			return setNewAuthorAndDisplay(state, payload);
		case UPDATE_CREDIT_DISPLAY_VALUE:
			return state.setIn([payload.rowId, 'name'], payload.value);
		case UPDATE_CREDIT_JOIN_PHRASE_VALUE:
			return state.setIn([payload.rowId, 'joinPhrase'], payload.value);
		case REMOVE_AUTHOR_CREDIT_ROW:
			return deleteAuthorCreditRow(state, payload);
		// no default
	}
	return state;
}

export default reducer;
