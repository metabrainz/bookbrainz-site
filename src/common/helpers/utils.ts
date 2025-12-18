import {EntityType, Relationship, RelationshipForDisplay} from '../../client/entity-editor/relationship-editor/types';

import {isString, kebabCase, toString, upperFirst} from 'lodash';
import {IdentifierType} from '../../client/unified-form/interface/type';
import type {LazyLoadedEntityT} from 'bookbrainz-data/lib/types/entity';

/**
 * Regular expression for valid BookBrainz UUIDs (bbid)
 *
 * @private
 */
const _bbidRegex =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Tests if a BookBrainz UUID is valid
 *
 * @param {string} bbid - BookBrainz UUID to validate
 * @returns {boolean} - Returns true if BookBrainz UUID is valid
 */
export function isValidBBID(bbid: string): boolean {
	return _bbidRegex.test(bbid);
}

/**
 * Returns all entity models defined in bookbrainz-data-js
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {object} - Object mapping model name to the entity model
 */
export function getEntityModels(orm: any) {
	const {Author, Edition, EditionGroup, Publisher, Series, Work} = orm;
	return {
		Author,
		Edition,
		EditionGroup,
		Publisher,
		Series,
		Work
	};
}

/**
 * Retrieves the Bookshelf entity model with the given the model name
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} type - Name or type of model
 * @throws {Error} Throws a custom error if the param 'type' does not
 * map to a model
 * @returns {object} - Bookshelf model object with the type specified in the
 * single param
 */
export function getEntityModelByType(orm: any, type: string): any {
	const entityModels = getEntityModels(orm);

	if (!entityModels[type]) {
		throw new Error(`Unrecognized entity type: '${type}'`);
	}

	return entityModels[type];
}

/**
 * This function maps `{a: somePromise}` to a promise that
 * resolves with `{a: resolvedValue}`.
 * @param {object} obj - an object with Promises as values
 * @returns {Promise<object>} - A Promise resolving to the object with resolved values
 */
type Unresolved<T> = {
	[P in keyof T]: Promise<T[P]>;
};
export async function makePromiseFromObject<T>(obj: Unresolved<T>): Promise<T> {
	const keys = Object.keys(obj);
	const values = Object.values(obj);
	try {
		const resolved = await Promise.all(values);
		const res = {};
		for (let i = 0; i < keys.length; i += 1) {
			res[keys[i]] = resolved[i];
		}
		return res as T;
	}
	catch (error) {
		console.error('Error in makePromiseFromObject:', error);
		throw error;
	}
}

/**
 * This function sorts the relationship array
 * @param {string} sortByProperty - name of property which will be used for sorting
 * @returns {array} - sorted relationship array
 */
export function sortRelationshipOrdinal(sortByProperty: string) {
	return (a: RelationshipForDisplay | Relationship, b: RelationshipForDisplay | Relationship) => {
		const value1 = a[sortByProperty] || '';
		const value2 = b[sortByProperty] || '';
		// eslint-disable-next-line no-undefined
		return value1.localeCompare(value2, undefined, {numeric: true});
	};
}

/**
 * This function repalces other space control character to U+0020 and trim extra spaces
 * @param {string} text - text to sanitize
 * @returns {string} - sanitized text
 */
export function collapseWhiteSpaces(text:string):string {
	// replace any whitespace space characters
	const spaceRegex = RegExp(/\s+/gi);
	const sanitizedText = text.replace(spaceRegex, '\u0020');
	return sanitizedText.trim();
}

/**
 * This function is to sanitize text inputs
 * @param {string} text - text to sanitize
 * @returns {string} - sanitized text
 */
export function sanitize(text:string):string {
	if (!isString(text)) {
		return text;
	}
	// unicode normalization to convert text into normal text
	let sanitizeText = text.normalize('NFC');
	sanitizeText = collapseWhiteSpaces(sanitizeText);
	// eslint-disable-next-line no-control-regex
	// https://www.w3.org/TR/xml/#charsets remove invalid xml characters
	const invalidXMLRgx = RegExp(/[^\u0020-\uD7FF\uE000-\uFFFD]/gi);
	sanitizeText = sanitizeText.replace(invalidXMLRgx, '');
	// get rid of all control charcters
	const ccRegex = RegExp(/[\u200B\u00AD\p{Cc}]/gu);
	sanitizeText = sanitizeText.replace(ccRegex, '');
	sanitizeText = collapseWhiteSpaces(sanitizeText);
	return sanitizeText;
}

/**
 * Takes a flatten object and convert it into unflatten one
 * eg. { "a.c": 2 } -> { "a": { "c" : 2 } }
 *
 * @param {Object} flattenObj the flattened object i.e in diasy chain form
 */

export function unflatten(flattenObj) {
	const result = {};
	let cur;
	let prop;
	let parts;
	if (Array.isArray(flattenObj) || Object(flattenObj) !== flattenObj) {
		return flattenObj;
	}
	for (const dotKey in flattenObj) {
		if (Object.prototype.hasOwnProperty.call(flattenObj, dotKey)) {
			cur = result;
			prop = '';
			parts = dotKey.split('.');
			for (let i = 0; i < parts.length; i++) {
				cur = cur[prop] || (cur[prop] = {});
				prop = parts[i];
			}
			cur[prop] = flattenObj[dotKey];
		}
	}
	return result[''] ?? {};
}

/**
 * Returns an API path for interacting with the given Bookshelf entity model
 *
 * @param {object} entity - Entity object
 * @returns {string} - URL path to interact with entity
 */
export function getEntityLink(entity: {type: string, bbid: string}): string {
	return `/${kebabCase(entity.type)}/${entity.bbid}`;
}

export function getNextEnabledAndResultsArray(array, size) {
	if (array.length > size) {
		while (array.length > size) {
			array.pop();
		}
		return {
			newResultsArray: array,
			nextEnabled: true
		};
	}
	return {
		newResultsArray: array,
		nextEnabled: false
	};
}

/**
 * Calculate check digit for isbn10
 * @param {string} isbn ISBN-10
 * @returns {string} check digit
 */

export function calIsbn10Chk(isbn:string):string {
	let digits = [];
	let sum = 0;
	let chkDigit;

	digits = `${isbn}`.substring(0, 9).split('');

	for (let i = 0; i < 9; i++) {
		sum += digits[i] * (10 - i);
	}

	const chkTmp = 11 - (sum % 11);
	switch (chkTmp) {
		case 10:
			chkDigit = 'X';
			break;
		case 11:
			chkDigit = 0;
			break;
		default:
			chkDigit = chkTmp;
			break;
	}
	return toString(chkDigit);
}

/**
 * Calculate check digit for isbn13
 * @param {string} isbn ISBN-13
 * @returns {string} check digit
 */
export function calIsbn13Chk(isbn:string):string {
	let totalSum = 0;
	for (let i = 0; i < 12; i++) {
		totalSum += Number(isbn.charAt(i)) * ((i % 2) === 0 ? 1 : 3);
	}

	const lastDigit = (10 - (totalSum % 10)) % 10;
	return toString(lastDigit);
}

/**
 * Convert ISBN-10 to ISBN-13
 * @param {string} isbn10 valid ISBN-10
 * @returns {string} ISBN-13
 */

export function isbn10To13(isbn10:string):string | null {
	const isbn10Regex = RegExp(/^(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$)[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/);
	if (!isbn10Regex.test(isbn10)) {
		return null;
	}
	const tempISBN10 = `${isbn10}`.replaceAll('-', '');

	const isbn13 = `978${tempISBN10.substring(0, 9)}`;

	const lastDigit = calIsbn13Chk(isbn13);
	return isbn13 + lastDigit;
}

/**
 * Convert ISBN-13 to ISBN-10
 * @param {string} isbn13 valid ISBN-13
 * @returns {string} ISBN-10
 */

export function isbn13To10(isbn13:string):string | null {
	const isbn13Regex = RegExp(/^(?=[0-9]{13}$|(?=(?:[0-9]+[- ]){1,4})[- 0-9]{14,17}$)978[- ]?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9]$/);
	if (!isbn13Regex.test(isbn13)) {
		return null;
	}
	const tempISBN13 = isbn13.replaceAll('-', '');
	const digits = tempISBN13.substring(3, 12).split('');
	digits.push(calIsbn10Chk(digits.join('')));

	return digits.join('');
}
export function filterIdentifierTypesByEntityType(
	identifierTypes: Array<{id: number, entityType: string}>,
	entityType: string
): Array<IdentifierType> {
	return identifierTypes.filter(
		(type) => type.entityType === entityType
	);
}

/**
 *
 * @param {Object} orm - orm
 * @param {string} bbid - bookbrainz id
 * @param {Array} otherRelations - entity specific relations to fetch
 * @returns {Promise} - Promise resolves to entity data if exist else null
 */
export async function getEntityByBBID(orm, bbid:string, otherRelations:Array<string> = []):Promise<Record<string, any> | null> {
	if (!isValidBBID(bbid)) {
		return null;
	}
	const {Entity} = orm;
	try {
		const redirectBbid = await orm.func.entity.recursivelyGetRedirectBBID(orm, bbid, null);
		const entity = await new Entity({bbid: redirectBbid}).fetch({require: false});
		if (!entity) {
			return null;
		}
		const entityType = entity.get('type');
		const baseRelations = [
			'annotation',
			'disambiguation',
			'defaultAlias',
			'relationshipSet.relationships.type',
			'aliasSet.aliases',
			'identifierSet.identifiers',
			...otherRelations
		];
		const entityData = await orm.func.entity.getEntity(orm, entityType, bbid, baseRelations);
		return entityData;
	}
	catch (error) {
		console.error('Error fetching entity by BBID:', error);
		return null;
	}
}

export async function getEntity(orm, bbid:string, type:EntityType, fetchOptions?:Record<string, any>):Promise<any> {
	if (!isValidBBID(bbid)) {
		return null;
	}
	try {
		const finalBBID = await orm.func.entity.recursivelyGetRedirectBBID(orm, bbid);
		const Model = getEntityModelByType(orm, upperFirst(type));
		const entity = await new Model({bbid: finalBBID})
			.fetch({require: true, ...fetchOptions});
		return entity && entity.toJSON();
	}
	catch (error) {
		console.error('Error fetching entity:', error);
		return null;
	}
}

export function getAliasLanguageCodes(entity: LazyLoadedEntityT) {
	return entity.aliasSet?.aliases
		.map((alias) => alias.language?.isoCode1)
		// less common languages (and [Multiple languages]) do not have a two-letter ISO code, ignore them for now
		.filter((language) => language !== null)
		// eslint-disable-next-line operator-linebreak -- fallback refers to the whole optional chain
		?? [];
}

export function filterObject(obj, filter) {
	return Object.keys(obj)
		.filter((key) => filter(obj[key]))
		.reduce((res, key) => Object.assign(res, {[key]: obj[key]}), {});
}