import aliasEditorReducer from '../entity-editor/alias-editor/reducer';
import annotationSectionReducer from '../entity-editor/annotation-section/reducer';
import buttonBarReducer from '../entity-editor/button-bar/reducer';
import {combineReducers} from 'redux';
import editionSectionReducer from '../entity-editor/edition-section/reducer';
import identifierEditorReducer from '../entity-editor/identifier-editor/reducer';
import nameSectionReducer from '../entity-editor/name-section/reducer';
import submissionSectionReducer from '../entity-editor/submission-section/reducer';


type ReduxWindow = typeof window & {__REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any};
export function shouldDevToolsBeInjected(): boolean {
	return Boolean(
		typeof window === 'object' &&
		(window as ReduxWindow).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
	);
}

export function createRootReducer() {
	return combineReducers({
		aliasEditor: aliasEditorReducer,
		annotationSection: annotationSectionReducer,
		buttonBar: buttonBarReducer,
		editionSection: editionSectionReducer,
		identifierEditor: identifierEditorReducer,
		nameSection: nameSectionReducer,
		submissionSection: submissionSectionReducer
	});
}
