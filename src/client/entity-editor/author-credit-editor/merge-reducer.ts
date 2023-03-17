import {
	Action,
	UPDATE_AUTHOR_CREDIT
} from './actions';
import Immutable from 'immutable';


function reducer(
	state = Immutable.Map({
		authorCount: 0,
		id: null,
		names: []
	}),
	action: Action
) {
	const {type, payload} = action;

	switch (type) {
		// This action is used for the merging page, where users select an existing author credit
		// rather than use the authorCreditEditor reducer which has a different structure
		case UPDATE_AUTHOR_CREDIT:
			return Immutable.fromJS(payload);
		// no default
	}
	return state;
}

export default reducer;
