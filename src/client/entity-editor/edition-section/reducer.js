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

// @flow

import * as Immutable from 'immutable';
import * as _ from 'lodash';

import {
	type Action,
	SHOW_EDITION_GROUP,
	SHOW_PHYSICAL,
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
import {HIDE_AUTHOR_CREDIT_EDITOR, SHOW_AUTHOR_CREDIT_EDITOR} from '../author-credit-editor/actions';


type State = Immutable.Map<string, any>;

function reducer(
	state: State = Immutable.Map({
		authorCreditEditorVisible: false,
		format: null,
		languages: Immutable.List([]),
		publisher: null,
		releaseDate: '',
		status: null
	}),
	action: Action
): State {
	const {type, payload} = action;
	switch (type) {
		case SHOW_PHYSICAL:
			return state.set('physicalVisible', true);
		case SHOW_EDITION_GROUP:
			return state.set('editionGroupVisible', true);
		case UPDATE_LANGUAGES:
			return state.set('languages', Immutable.fromJS(payload));
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
			return state.set('matchingNameEditionGroups', payload)
				.set('editionGroup', Immutable.fromJS({
					disambiguation: _.get(payload[0], ['disambiguation', 'comment']),
					id: payload[0].bbid,
					text: _.get(payload[0], ['defaultAlias', 'name']),
					type: payload[0].type,
					value: payload[0].bbid
				}));
		// no default
	}
	return state;
}

export default reducer;
