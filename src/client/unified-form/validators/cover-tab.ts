import {get, size} from 'lodash';
import {validateAuthorCreditSection, validateIdentifiers, validateNameSection} from '../../entity-editor/validators/common';

/**
 * Validates the ISBN Field.
 *
 * @param {object} isbn - ISBN state object containing `type` and `value`
 * @returns {boolean} - true if valid, false if invalid
 */
export function validateISBN(isbn) {
	// since type will already be defined for valid ISBNs
	return !(
		Boolean(isbn) &&
        !get(isbn, 'type', null) &&
        get(isbn, 'value', '').length > 0
	);
}

/**
 * Validates the Cover Tab state.
 *
 * @param {object} data - the form state object
 * @param {Array} identifierTypes - the list of identifier types
 * @returns {boolean} - true if form state valid, false if invalid
 */
export function validateCoverTab(data:any, identifierTypes:any[]) {
	return validateNameSection(get(data, 'nameSection')) &&
    validateIdentifiers(get(data, 'identifierEditor', {}), identifierTypes) &&
    validateAuthorCreditSection(get(data, 'authorCreditEditor')) &&
    validateISBN(get(data, 'ISBN'));
}

/**
 *  Check whether Cover Tab is modified or not.
 *
 * @param {object} data - the form state object
 * @returns {boolean} - true if cover tab state empty
 */
export function isCoverTabEmpty(data:any) {
	const nameSection = get(data, 'nameSection', {});
	const authorCreditEditor = get(data, 'authorCreditEditor', {});
	const ISBN = get(data, 'ISBN', {});
	const identifierEditor = get(data, 'identifierEditor', {});
	return nameSection.name?.length === 0 &&
    nameSection.sortName?.length === 0 &&
    !nameSection.language &&
    nameSection.disambiguation?.length === 0 &&
    size(authorCreditEditor) === 1 &&
    !authorCreditEditor.n0?.author &&
    size(identifierEditor) === 0 &&
    !ISBN.type;
}
