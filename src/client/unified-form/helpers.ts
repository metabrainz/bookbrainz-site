import {ADD_AUTHOR, ADD_PUBLISHER} from './cover-tab/action';
import {Action, State} from './interface/type';
import {CLOSE_ENTITY_MODAL, DUMP_EDITION, LOAD_EDITION, OPEN_ENTITY_MODAL} from './action';
import {ISBNReducer, authorsReducer, autoISBNReducer, publishersReducer} from './cover-tab/reducer';
import {seriesReducer, worksReducer} from './content-tab/reducer';
import {ADD_EDITION_GROUP} from './detail-tab/action';
import {DUPLICATE_WORK} from './content-tab/action';
import Immutable from 'immutable';
import aliasEditorReducer from '../entity-editor/alias-editor/reducer';
import annotationSectionReducer from '../entity-editor/annotation-section/reducer';
import authorCreditEditorReducer from '../entity-editor/author-credit-editor/reducer';
import authorSectionReducer from '../entity-editor/author-section/reducer';
import buttonBarReducer from '../entity-editor/button-bar/reducer';
import {camelCase} from 'lodash';
import {combineReducers} from 'redux-immutable';
import {convertMapToObject} from '../helpers/utils';
import editionGroupSectionReducer from '../entity-editor/edition-group-section/reducer';
import editionGroupsReducer from './detail-tab/reducer';
import editionSectionReducer from '../entity-editor/edition-section/reducer';
import identifierEditorReducer from '../entity-editor/identifier-editor/reducer';
import nameSectionReducer from '../entity-editor/name-section/reducer';
import publisherSectionReducer from '../entity-editor/publisher-section/reducer';
import relationshipSectionReducer from '../entity-editor/relationship-editor/reducer';
import seriesSectionReducer from '../entity-editor/series-section/reducer';
import submissionSectionReducer from '../entity-editor/submission-section/reducer';
import workSectionReducer from '../entity-editor/work-section/reducer';


type ReduxWindow = typeof window & {__REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any};
export function shouldDevToolsBeInjected(): boolean {
	return Boolean(
		typeof window === 'object' &&
		(window as ReduxWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	);
}

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
function entityModalIsOpenReducer(state = false, action) {
	const {type} = action;
	switch (type) {
		case OPEN_ENTITY_MODAL:
			return true;
		case CLOSE_ENTITY_MODAL:
			return false;
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
		authorCreditEnable: true,
		editionGroupVisible: true,
		format: null,
		languages: Immutable.List([]),
		matchingNameEditionGroups: [],
		physicalEnable: true,
		publisher: Immutable.Map({}),
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

// this reducer act as a intermediary between the entity editor reducers and the UF state
function crossSliceReducer(state:State, action:Action) {
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
	const newEntity = action.payload && action.payload.value;
	// Designed for single edition entity, will need to be modified to support multiple editions
	switch (type) {
		case ADD_AUTHOR:
			// add new author for AC in edition
			intermediateState = intermediateState.setIn(['authorCreditEditor', action.payload.rowId, 'author'], Immutable.Map({
				__isNew__: true,
				id: newEntity.id,
				rowId: action.payload.rowId,
				text: newEntity.text,
				type: 'Author'
			}));
			intermediateState = intermediateState.setIn(
				['authorCreditEditor', action.payload.rowId, 'name'], newEntity.text
			);
			break;
		case DUMP_EDITION:
			// dump/save current edition state to `Editions`
			action.payload.value = {
				...activeEntityState,
				authorCreditEditor: state.get('authorCreditEditor'),
				editionSection: state.get('editionSection')
			};
			// reset the state after saving
			intermediateState = intermediateState.merge(initialState);
			// keep the AC modal open after resetting state
			intermediateState = intermediateState.setIn(['editionSection', 'authorCreditEditorVisible'],
				state.getIn(['editionSection', 'authorCreditEditorVisible']));
			if (action.payload.type && camelCase(action.payload.type) === 'editionGroup') {
				// only reset AC state if required
				intermediateState = intermediateState.set('authorCreditEditor', initialACState);
			}
			// default alias language of new entity will be same as of edition
			intermediateState = intermediateState.setIn(['nameSection', 'language'], activeEntityState.nameSection.get('language', null));
			break;
		case ADD_EDITION_GROUP:
			// add new edition group for edition
			intermediateState = intermediateState.setIn(['editionSection', 'editionGroup'], newEntity);
			break;
		case ADD_PUBLISHER: {
			// add new publisher for edition
			// set new publisher in edition state as well
			intermediateState = intermediateState.setIn(
				['editionSection', 'publisher', newEntity.id]
				, Immutable.Map(newEntity)
			);
			break;
		}
		case DUPLICATE_WORK:
		// copy work state from `Works`
		{
			const fromWork:State = intermediateState.getIn(['Works', action.payload]);
			const defaultAlias = fromWork.get('defaultAlias');
			const relationships = fromWork.getIn(['relationshipSet', 'relationships'], null);
			const identifiers = fromWork.getIn(['identifierSet', 'identifiers'], null);
			const other:any = {};
			if (identifiers) {
				const identifierEditor = identifiers.map((identifier) => Immutable.Map({type: identifier.get('typeId'),
					value: identifier.get('value')}));
				other.identifierEditor = identifierEditor;
			}
			if (relationships) {
				const rels = relationships.map((rel, key) => {
					const relationship = convertMapToObject(rel);
					relationship.rowId = `t-${key}`;
					relationship.sourceEntity = {
						bbid: relationship.source.bbid,
						defaultAlias: {
							name: relationship.source.name
						},
						type: relationship.source.type
					};
					relationship.targetEntity = {
						bbid: relationship.target.bbid,
						defaultAlias: {
							name: relationship.target.name
						},
						type: relationship.target.type
					};
					relationship.relationshipType = relationship.type;
					return Immutable.fromJS(relationship);
				});
				other.relationshipSection = {
					canEdit: true,
					lastRelationships: null,
					relationshipEditorProps: null,
					relationshipEditorVisible: false,
					relationships: rels
				};
			}
			const changedAttributes = Immutable.fromJS({
				nameSection: {
					language: defaultAlias.get('languageId'),
					name: defaultAlias.get('name'),
					sortName: defaultAlias.get('sortName')
				},
				workSection: {
					type: fromWork.get('typeId')
				},
				...other
			});
			intermediateState = intermediateState.merge(changedAttributes);
			// get rid of properities that are not needed
			intermediateState = ['text', '__isNew__', 'type', 'id'].reduce((istate, key) => istate.delete(key), intermediateState);
			break;
		}
		case LOAD_EDITION:
		{
			// load old edition state from `Editions`
			intermediateState = intermediateState.merge(intermediateState.getIn(['Editions', action.payload.id]));
			// check whether the new edition group has been added
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
		// first pass the state to our cross slice reducer to handle UF specific actions.
		const intermediateState = crossSliceReducer(state, action);
		return combineReducers({
			Authors: authorsReducer,
			EditionGroups: editionGroupsReducer,
			Editions: newEditionReducer,
			ISBN: ISBNReducer,
			Publishers: publishersReducer,
			Series: seriesReducer,
			Works: worksReducer,
			aliasEditor: aliasEditorReducer,
			annotationSection: annotationSectionReducer,
			authorCreditEditor: authorCreditEditorReducer,
			authorSection: authorSectionReducer,
			autoISBN: autoISBNReducer,
			buttonBar: buttonBarReducer,
			editionGroupSection: editionGroupSectionReducer,
			editionSection: editionSectionReducer,
			entityModalIsOpen: entityModalIsOpenReducer,
			identifierEditor: identifierEditorReducer,
			nameSection: nameSectionReducer,
			publisherSection: publisherSectionReducer,
			relationshipSection: relationshipSectionReducer,
			seriesSection: seriesSectionReducer,
			submissionSection: submissionSectionReducer,
			workSection: workSectionReducer
		})(intermediateState, action);
	};
}
