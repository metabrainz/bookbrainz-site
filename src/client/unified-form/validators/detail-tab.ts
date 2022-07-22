import {get} from 'lodash';
import {validateEditionSection} from '../../entity-editor/validators/edition';


const initialEditionSection = JSON.stringify({
	authorCreditEditorVisible: false,
	format: null,
	languages: [],
	matchingNameEditionGroups: [],
	physicalEnable: true,
	publisher: {},
	releaseDate: '',
	status: null
});

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
	return JSON.stringify(editionSection) === initialEditionSection && annotationContent.length === 0;
}
