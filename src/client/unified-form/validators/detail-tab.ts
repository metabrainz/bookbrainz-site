import {get} from 'lodash';
import {validateEditionSection} from '../../entity-editor/validators/edition';


export const initialEditionSection = {
	authorCreditEditorVisible: false,
	format: null,
	languages: [],
	matchingNameEditionGroups: [],
	physicalEnable: true,
	publisher: {},
	releaseDate: '',
	status: null
};
const stringifiedState = JSON.stringify(initialEditionSection);

/**
 * 	Validates the Detail Tab state.
 *
 * @param {object} data - the form state object
 * @returns {boolean} - true if detail tab state is valid
 */
export function validateDetailTab(data: any): boolean {
	return validateEditionSection(get(data, 'editionSection'));
}

/**
 * Check whether Detail Tab is modified or not.
 *
 * @param {object} data - the form state object
 * @returns {boolean} - true if detail tab state is empty
 */
export function isDetailTabEmpty(data:any): boolean {
	const editionSection = get(data, 'editionSection', {});
	const annotationContent = get(data, ['annotationSection', 'content'], '');
	return JSON.stringify(editionSection) === stringifiedState && annotationContent.length === 0;
}
