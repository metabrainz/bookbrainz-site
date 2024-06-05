import {State} from '../interface/type';
import {convertMapToObject} from '../../helpers/utils';
import {get} from 'lodash';
import {validateISBN} from './cover-tab';

/**
 * Validate the unified form state
 *
 * @param {Function} validator - validator function
 * @returns {Function} - uf validator function
 */

export function getUfValidator(validator:any): {(state: State, ...args: any[]): boolean} {
	return (state, identifierTypes, ...args) => {
		const jsonState = convertMapToObject(state);
		return validateISBN(get(jsonState, 'ISBN')) && validator(jsonState, identifierTypes, ...args);
	};
}
