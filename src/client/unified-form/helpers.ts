import ISBNReducer from './cover-tab/reducer';
import aliasEditorReducer from '../entity-editor/alias-editor/reducer';
import annotationSectionReducer from '../entity-editor/annotation-section/reducer';
import buttonBarReducer from '../entity-editor/button-bar/reducer';
import {combineReducers} from 'redux-immutable';
import editionSectionReducer from '../entity-editor/edition-section/reducer';
import identifierEditorReducer from '../entity-editor/identifier-editor/reducer';
import nameSectionReducer from '../entity-editor/name-section/reducer';
import relationshipSectionReducer from '../entity-editor/relationship-editor/reducer';
import submissionSectionReducer from '../entity-editor/submission-section/reducer';
import {validateForm as validateAuthorForm} from '../entity-editor/validators/author';
import {validateForm as validateEditionForm} from '../entity-editor/validators/edition';
import {validateForm as validatePublisherForm} from '../entity-editor/validators/publisher';
import {validateForm as validateWorkForm} from '../entity-editor/validators/work';
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


export function createRootReducer() {
	return combineReducers({
		ISBN: ISBNReducer,
		aliasEditor: aliasEditorReducer,
		annotationSection: annotationSectionReducer,
		buttonBar: buttonBarReducer,
		editionSection: editionSectionReducer,
		identifierEditor: identifierEditorReducer,
		nameSection: nameSectionReducer,
		relationshipSection: relationshipSectionReducer,
		submissionSection: submissionSectionReducer,
		works: worksReducer
	});
}
