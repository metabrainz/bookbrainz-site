import {ADD_AUTHOR, ADD_PUBLISHER} from './cover-tab/action';
import {DUMP_EDITION, LOAD_EDITION} from './action';
import {ISBNReducer, authorsReducer, publishersReducer} from './cover-tab/reducer';
import {ADD_EDITION_GROUP} from './detail-tab/action';
import {ADD_WORK} from './content-tab/action';
import Immutable from 'immutable';
import aliasEditorReducer from '../entity-editor/alias-editor/reducer';
import annotationSectionReducer from '../entity-editor/annotation-section/reducer';
import authorCreditEditorReducer from '../entity-editor/author-credit-editor/reducer';
import authorSectionReducer from '../entity-editor/author-section/reducer';
import buttonBarReducer from '../entity-editor/button-bar/reducer';
import {camelCase} from 'lodash';
import {combineReducers} from 'redux-immutable';
import editionGroupSectionReducer from '../entity-editor/edition-group-section/reducer';
import editionGroupsReducer from './detail-tab/reducer';
import editionSectionReducer from '../entity-editor/edition-section/reducer';
import identifierEditorReducer from '../entity-editor/identifier-editor/reducer';
import nameSectionReducer from '../entity-editor/name-section/reducer';
import publisherSectionReducer from '../entity-editor/publisher-section/reducer';
import relationshipSectionReducer from '../entity-editor/relationship-editor/reducer';
import submissionSectionReducer from '../entity-editor/submission-section/reducer';
import {validateForm as validateAuthorForm} from '../entity-editor/validators/author';
import {validateForm as validateEditionForm} from '../entity-editor/validators/edition';
import {validateForm as validatePublisherForm} from '../entity-editor/validators/publisher';
import {validateForm as validateWorkForm} from '../entity-editor/validators/work';
import workSectionReducer from '../entity-editor/work-section/reducer';
import worksReducer from './content-tab/reducer';


type ReduxWindow = typeof window & {__REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any};
export function shouldDevToolsBeInjected(): boolean {
	return Boolean(
		typeof window === 'object' &&
		(window as ReduxWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	);
}
export const validatorMap = {
	author: validateAuthorForm,
	edition: validateEditionForm,
	publisher: validatePublisherForm,
	work: validateWorkForm
};

// dummy reducer
function newEditionReducer(state = Immutable.Map({}), action) {
	const {type, payload} = action;
	switch (type) {
		case DUMP_EDITION:
			return state.set(payload.id, Immutable.fromJS(payload.value));
		case LOAD_EDITION:
			return Immutable.Map({});
		default:
			return state;
	}
}
const initialACState = Immutable.fromJS(
	{
		n0: {
			author: null,
			automaticJoinPhrase: true,
			joinPhrase: '',
			name: ''
		}
	}
);
const initialState = Immutable.Map({
	aliasEditor: Immutable.Map({}),
	annotationSection: Immutable.Map({content: ''}),
	buttonBar: Immutable.Map({
		aliasEditorVisible: false,
		identifierEditorVisible: false
	}),
	editionSection: Immutable.Map({
		authorCreditEditorVisible: false,
		editionGroupVisible: true,
		format: null,
		languages: Immutable.List([]),
		matchingNameEditionGroups: [],
		physicalEnable: true,
		publisher: null,
		releaseDate: '',
		status: null
	}),
	identifierEditor: Immutable.OrderedMap(),
	nameSection: Immutable.Map({
		disambiguation: '',
		exactMatches: [],
		language: null,
		name: '',
		searchResults: [],
		sortName: ''
	}),
	relationshipSection: Immutable.Map({
		canEdit: true,
		lastRelationships: null,
		relationshipEditorProps: null,
		relationshipEditorVisible: false,
		relationships: Immutable.OrderedMap()
	}),
	submissionSection: Immutable.Map({
		note: '',
		submitError: '',
		submitted: false
	}),
	workSection: Immutable.Map({
		languages: Immutable.List([]),
		type: null
	})
});

function crossSliceReducer(state, action) {
	const {type} = action;
	let intermediateState = state;
	const activeEntityState = {
		aliasEditor: state.get('aliasEditor'),
		annotationSection: state.get('annotationSection'),
		buttonBar: state.get('buttonBar'),
		identifierEditor: state.get('identifierEditor'),
		nameSection: state.get('nameSection'),
		relationshipSection: state.get('relationshipSection'),
		submissionSection: state.get('submissionSection')
	};
	switch (type) {
		case ADD_AUTHOR:
			intermediateState = intermediateState.setIn(['Editions', 'e0', 'authorCreditEditor', action.payload.rowId, 'author'], Immutable.Map({
				id: action.payload.id,
				rowId: action.payload.rowId,
				text: activeEntityState.nameSection.get('name'),
				type: 'Author'
			}));
			intermediateState = intermediateState.setIn(
				['Editions', 'e0', 'authorCreditEditor', action.payload.rowId, 'name'], activeEntityState.nameSection.get('name')
			);
			action.payload.value = action.payload.value ?? {
				...activeEntityState,
				__isNew__: true,
				authorSection: intermediateState.get('authorSection'),
				id: action.payload.id,
				text: activeEntityState.nameSection.get('name'),
				type: 'Author'
			};
			break;
		case DUMP_EDITION:
			action.payload.value = {
				...activeEntityState,
				authorCreditEditor: state.get('authorCreditEditor'),
				editionSection: state.get('editionSection')
			};
			intermediateState = intermediateState.merge(initialState);
			intermediateState = intermediateState.setIn(['editionSection', 'authorCreditEditorVisible'],
				state.getIn(['editionSection', 'authorCreditEditorVisible']));
			if (action.payload.type && camelCase(action.payload.type) === 'editionGroup') {
				intermediateState = intermediateState.set('authorCreditEditor', initialACState);
			}
			intermediateState = intermediateState.setIn(['nameSection', 'language'], activeEntityState.nameSection.get('language', null));
			break;
		case ADD_EDITION_GROUP:
			action.payload.value = action.payload.value ?? {
				...activeEntityState,
				__isNew__: true,
				editionGroupSection: intermediateState.get('editionGroupSection'),
				id: action.payload.id,
				text: activeEntityState.nameSection.get('name'),
				type: 'EditionGroup'
			};
			break;
		case ADD_WORK:
			action.payload.value = action.payload.value ?? {
				...activeEntityState,
				__isNew__: true,
				id: action.payload.id,
				text: activeEntityState.nameSection.get('name'),
				type: 'Work',
				workSection: intermediateState.get('workSection')
			};
			break;
		case ADD_PUBLISHER:
			action.payload.value = action.payload.value ?? {
				...activeEntityState,
				__isNew__: true,
				id: action.payload.id,
				publisherSection: intermediateState.get('publisherSection'),
				text: activeEntityState.nameSection.get('name'),
				type: 'Publisher'
			};
			break;
		case LOAD_EDITION:
		{
			intermediateState = intermediateState.merge(intermediateState.getIn(['Editions', action.payload.id]));
			const newEditionGroup = intermediateState.getIn(['EditionGroups', 'eg0'], null);
			if (newEditionGroup) {
				intermediateState = intermediateState.setIn(['editionSection', 'editionGroup'], newEditionGroup);
			}
			break;
		}
		default:
			break;
	}
	return intermediateState;
}

export function createRootReducer() {
	return (state: Immutable.Map<string, any>, action) => {
		const intermediateState = crossSliceReducer(state, action);
		return combineReducers({
			Authors: authorsReducer,
			EditionGroups: editionGroupsReducer,
			Editions: newEditionReducer,
			ISBN: ISBNReducer,
			Publishers: publishersReducer,
			Works: worksReducer,
			aliasEditor: aliasEditorReducer,
			annotationSection: annotationSectionReducer,
			authorCreditEditor: authorCreditEditorReducer,
			authorSection: authorSectionReducer,
			buttonBar: buttonBarReducer,
			editionGroupSection: editionGroupSectionReducer,
			editionSection: editionSectionReducer,
			identifierEditor: identifierEditorReducer,
			nameSection: nameSectionReducer,
			publisherSection: publisherSectionReducer,
			relationshipSection: relationshipSectionReducer,
			submissionSection: submissionSectionReducer,
			workSection: workSectionReducer
		})(intermediateState, action);
	};
}
