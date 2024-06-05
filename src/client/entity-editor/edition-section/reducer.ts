/* eslint-disable default-case */
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


import * as Immutable from 'immutable';

import {
	ADD_LANGUAGE,
	Action,
	DISABLE_PHYSICAL,
	ENABLE_PHYSICAL,
	TOGGLE_SHOW_EDITION_GROUP,
	UPDATE_DEPTH,
	UPDATE_EDITION_GROUP,
	UPDATE_FORMAT,
	UPDATE_HEIGHT,
	UPDATE_LANGUAGES,
	UPDATE_PAGES,
	UPDATE_PUBLISHER,
	UPDATE_RELEASE_DATE,
	UPDATE_STATUS,
	UPDATE_WARN_IF_EDITION_GROUP_EXISTS,
	UPDATE_WEIGHT,
	UPDATE_WIDTH
} from './actions';
import {HIDE_AUTHOR_CREDIT_EDITOR, SHOW_AUTHOR_CREDIT_EDITOR, TOGGLE_AUTHOR_CREDIT} from '../author-credit-editor/actions';


type State = Immutable.Map<string, any>;

function reducer(
	state: State = Immutable.Map({
		authorCreditEditorVisible: false,
		authorCreditEnable: true,
		format: null,
		languages: Immutable.List([]),
		matchingNameEditionGroups: [],
		physicalEnable: true,
		publisher: Immutable.fromJS({}),
		releaseDate: '',
		status: null
	}),
	action: Action
): State {
	const {type, payload} = action;
	switch (type) {
		case ENABLE_PHYSICAL:
			return state.set('physicalEnable', true);
		case DISABLE_PHYSICAL:
			return state.set('physicalEnable', false);
		case TOGGLE_SHOW_EDITION_GROUP:
			return state.set('editionGroupVisible', payload);
		case UPDATE_LANGUAGES:
			return state.set('languages', Immutable.fromJS(payload));
		case ADD_LANGUAGE:
			return state.update('languages', (languages) => (!payload ? languages : languages.push(payload)));
		case UPDATE_FORMAT:
			return state.set('format', payload);
		case UPDATE_PUBLISHER:
			return state.set('publisher', Immutable.fromJS(payload));
		case UPDATE_EDITION_GROUP:
			return state.set('editionGroup', Immutable.fromJS(payload));
		case UPDATE_RELEASE_DATE:
			return state.set('releaseDate', payload);
		case UPDATE_STATUS:
			return state.set('status', payload);
		case UPDATE_WEIGHT:
			return state.set('weight', payload);
		case UPDATE_PAGES:
			return state.set('pages', payload);
		case UPDATE_WIDTH:
			return state.set('width', payload);
		case UPDATE_HEIGHT:
			return state.set('height', payload);
		case UPDATE_DEPTH:
			return state.set('depth', payload);
		case HIDE_AUTHOR_CREDIT_EDITOR:
			return state.set('authorCreditEditorVisible', false);
		case SHOW_AUTHOR_CREDIT_EDITOR:
			return state.set('authorCreditEditorVisible', true);
		case UPDATE_WARN_IF_EDITION_GROUP_EXISTS:
			if (!Array.isArray(payload) || !payload.length) {
				return state.set('matchingNameEditionGroups', []);
			}
			return state.set('matchingNameEditionGroups', payload);
		case TOGGLE_AUTHOR_CREDIT:
			return state.set('authorCreditEnable', !state.get('authorCreditEnable'));
		// no default
	}
	return state;
}

export default reducer;
