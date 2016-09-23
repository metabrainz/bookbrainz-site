import Immutable from 'immutable';

function reducer(
	state = Immutable.Map({
		nameValue: '',
		sortNameValue: '',
		languageValue: null,
		disambiguationVisible: false,
		aliasEditorVisible: false
	}),
	action
) {
	switch (action.type) {
		case 'UPDATE_NAME_FIELD':
			return state.set('nameValue', action.value);
		case 'UPDATE_SORT_NAME_FIELD':
			return state.set('sortNameValue', action.value);
		case 'UPDATE_LANGUAGE_FIELD':
			return state.set('languageValue', action.value);
		case 'SHOW_DISAMBIGUATION':
			return state.set('disambiguationVisible', true);
		case 'SHOW_ALIAS_EDITOR':
			return state.set('aliasEditorVisible', true);
		case 'HIDE_ALIAS_EDITOR':
			return state.set('aliasEditorVisible', false);
		// no default
	}
	return state;
}

export default reducer;
