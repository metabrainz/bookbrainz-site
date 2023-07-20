/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2017  Sean Burke
 				 2019       Akhilesh Kumar (@akhilesh26)
 				 2020		Prabal Singh
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as search from '../../common/helpers/search';
import {filterIdentifierTypesByEntityType, unflatten} from '../../common/helpers/utils';
import _ from 'lodash';


export function getDateBeforeDays(days) {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
}

export function filterIdentifierTypesByEntity(
	identifierTypes: any[],
	entity: any
): any[] {
	const typesOnEntity = new Set();

	if (!entity.identifierSet || entity.identifierSet.identifiers.length < 1) {
		/*
		 * If there are no identifiers, skip the work of trying to add types
		 * which shouldn't be on this entity.
		 */
		return filterIdentifierTypesByEntityType(identifierTypes, entity.type);
	}

	for (const identifier of entity.identifierSet.identifiers) {
		typesOnEntity.add(identifier.type.id);
	}

	return identifierTypes.filter(
		(type) => type.entityType === entity.type || typesOnEntity.has(type.id)
	);
}

/**
 * Helper-function / template-tag that allows the values of an object that
 * is passed in at a later time to be interpolated into a
 * string.
 *
 * Cribbed from MDN documentation on template literals:
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 * @param {string[]} strings - Array of string literals from template
 * @returns {function(*)} - Takes an object/array as an argument.
 * When invoked, it will return a string with all the key names from
 * the tagged template literal replaced with their corresponding values
 * from the newly passed in object.
 */
type templateFuncType = (values: {[propName: string]: string}) => string;
export function template(strings: TemplateStringsArray, ...keys: Array<string>): templateFuncType {
	return (values): string => {
		const result = [strings[0]];

		keys.forEach((key, i) => {
			result.push(values[key], strings[i + 1]);
		});

		return result.join('');
	};
}

/**
 * Generates a page title for an entity row
 *
 * @param {object} entity - Entity object
 * @param {string} titleForUnnamed - Fallback title in case entity has no name
 * @param {function} templateForNamed - Accepts an object with a name field and
 * uses it to generate a title string
 * @returns {string} - Title string
 */
export function createEntityPageTitle(
	entity: any,
	titleForUnnamed: string,
	templateForNamed: templateFuncType
): string {
	/**
	 * User-visible strings should _never_ be created by concatenation; when we
	 * start to implement localization, it will create problems for users of
	 * many languages. This helper is here to make it a little easier to do the
	 * right thing.
	 */
	let title = titleForUnnamed;

	// Accept template with a "name" replacement field
	if (entity && entity.defaultAlias && entity.defaultAlias.name) {
		title = templateForNamed({name: entity.defaultAlias.name});
	}

	return title;
}

/**
 * Adds 1 to the edit count of the specified editor
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} id - row ID of editor to be updated
 * @param {object} transacting - Bookshelf transaction object (must be in
 * progress)
 * @returns {Promise} - Resolves to the updated editor model
 */
export function incrementEditorEditCountById(
	orm: any,
	id: number,
	transacting: any
): Promise<Record<string, unknown>> {
	const {Editor} = orm;
	return new Editor({id})
		.fetch({require: true, transacting})
		.then((editor) => {
			editor.incrementEditCount();
			return editor.save(null, {transacting});
		})
		.catch(Editor.NotFoundError, err => new Promise((resolve, reject) => reject(err)));
}

/**
 * Return additional relations to withRelated array according to modelType
 *
 * @param {string} modelType - type of the model or entity
 * @returns {array} array of additional relations
 */
export function getAdditionalRelations(modelType) {
	if (modelType === 'Work') {
		return ['disambiguation', 'workType', 'languageSet.languages'];
	}
	else if (modelType === 'Edition') {
		return ['disambiguation', 'releaseEventSet.releaseEvents', 'identifierSet.identifiers.type', 'editionFormat'];
	}
	return [];
}


/**
 * Takes an entity and converts it to a format acceptable to react-select.
 *
 * @param {Object} entity the entity to convert
 * @returns {Object} the formatted data
 */
export function entityToOption(entity) {
	return _.isNil(entity) ? null :
		{
			defaultAlias: entity.defaultAlias,
			disambiguation: entity.disambiguation ?
				entity.disambiguation.comment : null,
			id: entity.bbid,
			text: entity.defaultAlias ?
				entity.defaultAlias.name : '(unnamed)',
			type: entity.type
		};
}

/**
 * Takes an array of relationships and attach the deeply nested
 * relationship attributes to the first level of the relationship object.
 *
 * @param {Array} relationships the array of relationships
 */
export function attachAttributes(relationships) {
	relationships.forEach((relationship) => {
		if (relationship.attributeSet?.relationshipAttributes) {
			relationship.attributeSet.relationshipAttributes.forEach(attribute => {
				relationship[`${attribute.type.name}`] = attribute.value.textValue;
			});
		}
	});
}

/**
 * Fetch id related with label
 *
 * @param {object[]} fromOptions - Options
 * @param {string} label - related label
 * @param {string} keyName - key associated
 * @returns {number} - assigned id
 */
export function getIdByLabel(fromOptions:any[], label:string, keyName:string):number | null {
	for (const option of fromOptions) {
		if (option[keyName] === label) {
			return option.id;
		}
	}
	return null;
}

/**
 * Fetch Id of a model using field value
 *
 * @param {object} model - Model  eg. Language
 * @param {string} fieldName - given field eg. name
 * @param {string} fieldValue - given field value eg. English
 * @returns {Promise} - Resolves to required id
 */
export async function getIdByField(
	model:any,
	fieldName:string,
	fieldValue:string
):Promise<number | null> {
	return (await model.query({where: {[fieldName]: fieldValue}}).fetch({require: false}))?.get('id') ?? null;
}

/**
 * Generate Identifier state from req body
 *
 * @param {object} sourceIdentifierState - source state in format of t{typeId}:value
 * @returns {object} - correctly formatted identifierEditor state
 */
export function generateIdenfierState(sourceIdentifierState:Record<string, string>):Record<string, any> {
	let index = 0;
	const identifierState = {};
	for (const typeKey in sourceIdentifierState) {
		if (Object.prototype.hasOwnProperty.call(sourceIdentifierState, typeKey)) {
			identifierState[`${index}`] =
			{
				type: parseInt(typeKey.replace('t', ''), 10),
				value: sourceIdentifierState[typeKey]
			};
			index++;
		}
	}
	return identifierState;
}

/**
 * Generate EntitySection Language state from req body
 *
 * @param {object} sourceEntitySection - source entity section state in format of languages{index}:value
 * @param {object} orm - orm object
 *  @returns {Promise} - Resolves to modified state
 */
export async function parseLanguages(sourceEntitySection:Record<string, any>, orm):Promise<Record<string, any>> {
	if (!sourceEntitySection) { return sourceEntitySection; }
	const {Language} = orm;
	const languages = [];
	for (const langKey in sourceEntitySection) {
		if (Object.prototype.hasOwnProperty.call(sourceEntitySection, langKey)) {
			if (langKey.includes('languages')) {
				languages.push({
					label: _.upperFirst(sourceEntitySection[langKey]),
					// eslint-disable-next-line no-await-in-loop
					value: await getIdByField(Language, 'name', _.upperFirst(sourceEntitySection[langKey]))
				});
				delete sourceEntitySection[langKey];
			}
		}
	}
	sourceEntitySection.languages = languages;
	return sourceEntitySection;
}

/**
 * Generate react-select option from query
 * @param {object} orm - orm
 * @param {string} type - type eg. area
 * @param {string} query - query string
 * @param {string} idKey - key corresponding to id
 * @param {boolean} exactMatch - exact matching the query string
 * @returns {Promise} - resolves to option object
 */
export async function searchOption(orm, type:string, query:string, idKey = 'id', exactMatch = false):Promise<{
	disambiguation: string,
	id: number,
	text: string,
	type: string,

} | null> {
	let results;
	if (exactMatch) {
		results = await search.checkIfExists(orm, query, type);
	}
	else {
		results = await search.autocomplete(orm, query, type, 1);
	}
	if (results.length) {
		const firstMatch = results[0];
		const option = {
			disambiguation: idKey === 'id' ? firstMatch.disambiguation.comment : null,
			id: firstMatch[idKey],
			text: firstMatch.defaultAlias.name,
			type: firstMatch.type

		};
		return option;
	}

	return null;
}

/**
 * Parse NameSection, IdentifierEditor, AnnotationSection state from request body
 *
 * @param {object} req - Request object
 * @param {string} type - entity type
 * @returns {Promise} - Resolves to Entity initialState
 */
export async function parseInitialState(req, type):Promise<Record<string, any>> {
	const emptyState = {
		nameSection: {
			disambiguation: '',
			exactMatches: null,
			language: null,
			name: '',
			searchResults: null,
			sortName: ''
		}
	};
	const entity = unflatten(req.body);
	const {orm} = req.app.locals;
	const {Language} = orm;
	// NameSection State
	const initialState = Object.assign(emptyState, entity);
	// We allow Editions (but not other entities) to have the same primary name as another Edition without requiring a disambiguation
	if (initialState.nameSection.name && type !== 'edition') {
		initialState.nameSection.searchResults = await search.autocomplete(orm, initialState.nameSection.name, type, 10);
		initialState.nameSection.exactMatches = await search.checkIfExists(orm, initialState.nameSection.name, type);
	}
	if (initialState.nameSection.language) {
		initialState.nameSection.language = await getIdByField(Language, 'name', initialState.nameSection.language);
	}
	// IdentifierEditor State
	if (initialState.identifierEditor) {
		initialState.identifierEditor = generateIdenfierState(initialState.identifierEditor);
	}
	// AnnotationSection State
	if (initialState.annotationSection) {
		initialState.annotationSection = {
			content: initialState.annotationSection
		};
	}
	// SubmissionSection State
	if (initialState.submissionSection) {
		initialState.submissionSection = {
			note: initialState.submissionSection,
			submitError: '',
			submitted: false
		};
	}
	return initialState;
}

export function parseQuery(url: string) {
	return new URLSearchParams(url.replace(/^.+?\?/, ''));
}

export function getIntFromQueryParams(query: URLSearchParams, name: string, fallback = 0) {
	return parseInt(query.get(name), 10) || fallback;
}
