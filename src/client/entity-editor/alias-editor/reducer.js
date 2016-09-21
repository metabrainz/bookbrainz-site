
import Immutable from 'immutable';

const DEFAULT_ALIAS = Immutable.Map({
	name: '',
	sortName: '',
	language: null,
	primary: false
});

function reducer(
	state = Immutable.Map(),
	action
) {
	switch (action.type) {
		case 'ADD_ALIAS':
			return state.set(action.id, DEFAULT_ALIAS);
		case 'UPDATE_ALIAS_NAME':
			return state.setIn([action.index, 'name'], action.value);
		case 'UPDATE_ALIAS_SORT_NAME':
			return state.setIn([action.index, 'sortName'], action.value);
		case 'UPDATE_ALIAS_LANGUAGE':
			return state.setIn([action.index, 'language'], action.value);
		case 'UPDATE_ALIAS_PRIMARY':
			return state.setIn([action.index, 'primary'], action.value);
		case 'REMOVE_ALIAS':
			return state.delete(action.index);
		// no default
	}
	return state;
}

export default reducer;
