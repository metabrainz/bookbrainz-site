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
	ADD_AUTHOR_CREDIT_ROW,
	CLEAR_AUTHOR_CREDIT,
	REMOVE_AUTHOR_CREDIT_ROW,
	REMOVE_EMPTY_CREDIT_ROWS,
	RESET_AUTHOR_CREDIT,
	UPDATE_CREDIT_AUTHOR_VALUE,
	UPDATE_CREDIT_DISPLAY_VALUE,
	UPDATE_CREDIT_JOIN_PHRASE_VALUE
} from './actions';

import Immutable from 'immutable';


const EMPTY_CREDIT_ROW = Immutable.Map({
	author: null,
	automaticJoinPhrase: true,
	joinPhrase: '',
	name: ''
});

/* Shamelessly stolen from MusicBrainz server:
	https://github.com/metabrainz/musicbrainz-server/blob/ece12896ff67524279d7e00998da300162d93c0b/root/static/scripts/edit/components/ArtistCreditEditor.js#L28
*/
function addAuthorCreditRow(state, newItemKey) {
	// Add a new empty author credit row
	let returnedState = state.set(newItemKey, EMPTY_CREDIT_ROW);

	const autoJoinPhraseRegex = /^(| & |, )$/;
	const acNames = returnedState.toJS();
	const keys = Object.keys(acNames);
	const {size} = returnedState;
	// If there are already names in the author credit, add join phrases to them.
	// Depending on how many credits there are the join phrase will be an ampersand or a comma
	if (size > 0) {
		// New empty author credit, last item
		const name0Key = keys[size - 1];
		const name0 = acNames[name0Key];
		if (name0 && name0.automaticJoinPhrase !== false) {
			returnedState = returnedState.setIn([name0Key, 'joinPhrase'], '');
		}
	}
	if (size > 1) {
		// Second to last author credit
		const name1Key = keys[size - 2];
		const name1 = acNames[name1Key];
		if (name1 && name1.automaticJoinPhrase !== false &&
			autoJoinPhraseRegex.test(name1.joinPhrase)) {
			returnedState = returnedState.setIn([name1Key, 'joinPhrase'], ' & ');
		}
	}

	if (size > 2) {
		// Third to last author credit
		const name2Key = keys[size - 3];
		const name2 = acNames[name2Key];
		if (name2 && name2.automaticJoinPhrase !== false &&
			autoJoinPhraseRegex.test(name2.joinPhrase)) {
			returnedState = returnedState.setIn([name2Key, 'joinPhrase'], ', ');
		}
	  }

	return returnedState;
}

function setNewAuthorAndDisplay(state, payload) {
	if (payload.rowId === -1) {
		const firstRowKey = state.keySeq().first();
		payload.rowId = firstRowKey;
	}
	let returnState = state.setIn([payload.rowId, 'author'], Immutable.fromJS(payload));

	if (!payload.id) {
		// If the user has emptied the author field, also empty the display
		// name.
		returnState = returnState.setIn([payload.rowId, 'name'], '');
	}
	else {
		// When the user sets a new author, copy
		// the author's name to the display name field.
		returnState = returnState.setIn([payload.rowId, 'name'], payload.text);
	}

	return returnState;
}

function deleteAuthorCreditRow(state, payload) {
	const firstRowKey = state.keySeq().first();
	if (firstRowKey === payload) {
		return state.set(payload, EMPTY_CREDIT_ROW);
	}
	let returnState = state.delete(payload);

	// If names remain in the author credit, empty the join phrase for the last
	// name.
	const lastKey = returnState.keySeq().last();
	if (lastKey) {
		returnState = returnState.setIn([lastKey, 'joinPhrase'], '');
	}

	return returnState;
}
function deleteEmptyRows(state) {
	const firstRowKey = state.keySeq().first();
	const returnState = state.filterNot((row, rowId) =>
		(rowId !== firstRowKey) && row.get('author') === null && row.get('joinPhrase') === '' && row.get('name') === '');

	return returnState;
}
const initialState = {
	n0: EMPTY_CREDIT_ROW
};
function reducer(
	state = Immutable.OrderedMap(initialState),
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
		case UPDATE_CREDIT_JOIN_PHRASE_VALUE: {
			const returnState =	state.setIn([payload.rowId, 'joinPhrase'], payload.value);
			// The join phrase has been modified manually by the user,
			// from now on it shouldn't be automatically modified
			return returnState.setIn([payload.rowId, 'automaticJoinPhrase'], false);
		}
		case REMOVE_AUTHOR_CREDIT_ROW:
			return deleteAuthorCreditRow(state, payload);
		case REMOVE_EMPTY_CREDIT_ROWS:
			return deleteEmptyRows(state);
		case CLEAR_AUTHOR_CREDIT:
			return Immutable.OrderedMap({});
		case RESET_AUTHOR_CREDIT:
			return Immutable.OrderedMap(initialState);
		// no default
	}
	return state;
}

export default reducer;
