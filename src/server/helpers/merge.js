import * as entityRoutes from '../routes/entity/entity';
import * as utils from './utils';
import _ from 'lodash';


export const basicRelations = [
	'aliasSet.aliases.language',
	'annotation.lastRevision',
	'defaultAlias',
	'disambiguation',
	'identifierSet.identifiers.type',
	'relationshipSet',
	'revision.revision'
];

export function getEntityFetchPropertiesByType(entityType) {
	switch (entityType) {
		case 'Author':
			return ['authorType', 'beginArea', 'endArea', 'gender'];
		case 'Edition':
			return [
				'editionGroup.defaultAlias',
				'languageSet.languages',
				'editionFormat',
				'editionStatus',
				'releaseEventSet.releaseEvents',
				'publisherSet.publishers.defaultAlias'
			];
		case 'EditionGroup':
			return [
				'editionGroupType',
				'editions.defaultAlias',
				'editions.disambiguation',
				'editions.releaseEventSet.releaseEvents',
				'editions.identifierSet.identifiers.type',
				'editions.editionFormat'
			];
		case 'Publisher':
			return [
				'publisherType',
				'area'
			];
		case 'Work':
			return [
				'languageSet.languages',
				'workType'
			];
		default:
			return [];
	}
}

/**
 * @param {object} targetObject - Object to modify
 * @param {string} propName - Property name to set on the targetObject
 * @param {object} sourceObject - Source object to copy from
 * @param {string|string[]} [sourcePath=propName] - Path of the property to check on the sourceObject.
 * @description Mutates the targetObject, setting the value at propName if it isn't already set.
 * Accepts an optional path string or array of strings to allow get the source value at another path
 */
function assignIfNotSet(targetObject, propName, sourceObject, sourcePath = propName) {
	const sourceValue = _.get(sourceObject, sourcePath);
	if (_.isNil(targetObject[propName]) && !_.isNil(sourceValue)) {
	  targetObject[propName] = sourceValue;
	}
}

/**
 * @name getAuthorEntityMergeSection
 * @description Returns the initial form state for the Author merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Author merge section for the initialState
 */
function getAuthorEntityMergeSection(entities) {
	const authorSection = {};
	entities.forEach(entity => {
		assignIfNotSet(authorSection, 'type', entity, 'authorType.id');
		assignIfNotSet(authorSection, 'gender', entity, 'gender.id');
		assignIfNotSet(authorSection, 'beginDate', entity);
		assignIfNotSet(authorSection, 'endDate', entity);
		assignIfNotSet(authorSection, 'beginArea', entity);
		assignIfNotSet(authorSection, 'endArea', entity);
		assignIfNotSet(authorSection, 'ended', entity);
	});
	return Object.assign(authorSection,
		{
			beginArea: entityRoutes.areaToOption(authorSection.beginArea),
			endArea: entityRoutes.areaToOption(authorSection.endArea),

			/** If one of the entities has an end date or area and another doesn't,
			 * those endDate/Area properties will be automatically selected as the only option on the merge display page
			 * We want to emulate this for the initialState to match, so if there's any endDate/Are, set ended to true
			 */
			ended: (!_.isNil(authorSection.endArea) || !_.isNil(authorSection.endDate)) || authorSection.ended
		});
}

/**
 * @name getEditionEntityMergeSection
 * @description Returns the initial form state for the Edition merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Edition merge section for the initialState
 */
function getEditionEntityMergeSection(entities) {
	const editionSection = {};
	entities.forEach(entity => {
		assignIfNotSet(editionSection, 'depth', entity);
		assignIfNotSet(editionSection, 'editionGroup', entity);
		assignIfNotSet(editionSection, 'format', entity, 'editionFormat.id');
		assignIfNotSet(editionSection, 'height', entity);
		assignIfNotSet(editionSection, 'pages', entity);
		assignIfNotSet(editionSection, 'publisher', entity, 'publisherSet.publishers[0]');
		assignIfNotSet(editionSection, 'releaseDate', entity, 'releaseEventSet.releaseEvents[0].date');
		assignIfNotSet(editionSection, 'status', entity, 'editionStatus.id');
		assignIfNotSet(editionSection, 'weight', entity);
		assignIfNotSet(editionSection, 'width', entity);
	});
	const languages = _.flatMap(entities, entity => _.get(entity, 'languageSet.languages', []).map(
		({id, name}) => ({label: name, value: id})
	));
	return Object.assign(editionSection,
		{
			editionGroup: utils.entityToOption(editionSection.editionGroup),
			languages: _.uniqBy(languages, 'value'),
			publisher: utils.entityToOption(editionSection.publisher)
		});
}

/**
 * @name getEditionGroupEntityMergeSection
 * @description Returns the initial form state for the Edition Group merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Edition Group merge section for the initialState
 */
function getEditionGroupEntityMergeSection(entities) {
	const editionGroupSection = {editions: []};
	entities.forEach(entity => {
		assignIfNotSet(editionGroupSection, 'type', entity, 'typeId');
		editionGroupSection.editions.push(...entity.editions);
	});

	return editionGroupSection;
}

/**
 * @name getPublisherEntityMergeSection
 * @description Returns the initial form state for the Publisher merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Publisher merge section for the initialState
 */
function getPublisherEntityMergeSection(entities) {
	const publisherSection = {};
	entities.forEach(entity => {
		assignIfNotSet(publisherSection, 'area', entity);
		assignIfNotSet(publisherSection, 'beginDate', entity);
		assignIfNotSet(publisherSection, 'endDate', entity);
		assignIfNotSet(publisherSection, 'ended', entity);
		assignIfNotSet(publisherSection, 'type', entity, 'typeId');
	});
	return Object.assign(publisherSection,
		{
			area: entityRoutes.areaToOption(publisherSection.area),

			/** If one of the entities has an end date and another doesn't,
			 * that endDate property will be automatically selected as the only option on the merge display page
			 * We want to emulate this for the initialState to match, so if there's any endDate, set ended to true
			 */
			ended: !_.isNil(publisherSection.endDate) || publisherSection.ended
		});
}

/**
 * @name getWorkEntityMergeSection
 * @description Returns the initial form state for the Work merging page, based on the multiple entities.
 * The returned section has some properties transformed to a state acceptable by the reducer.
 * @param {object[]} entities - The array of entities to merge the properties of
 * @returns {object} - The Work merge section for the initialState
 */
function getWorkEntityMergeSection(entities) {
	const workSection = {};
	entities.forEach(entity => {
		assignIfNotSet(workSection, 'type', entity, 'typeId');
	});
	const languages = _.flatMap(entities, entity => _.get(entity, 'languageSet.languages', []).map(
		({id, name}) => ({label: name, value: id})
	));
	return Object.assign(workSection,
		{
			languages: _.uniqBy(languages, 'value')
		});
}

/**
 * @description Returns the initial form state for the $entity$ section depending on the entity type
 * @param {string} entityType - Entity type string (lowercased)
 * @param {object[]} entities - Array of entities to merge
 * @returns {object} - The entity section initial form state
 * @throws Will throw an error if the entityType is not one of the know entity types, lowercased.
 */
export function getEntitySectionByType(entityType, entities) {
	switch (entityType) {
		case 'author':
			return getAuthorEntityMergeSection(entities);
		case 'edition':
			return getEditionEntityMergeSection(entities);
		case 'editionGroup':
			return getEditionGroupEntityMergeSection(entities);
		case 'publisher':
			return getPublisherEntityMergeSection(entities);
		case 'work':
			return getWorkEntityMergeSection(entities);
		default:
			throw new Error(`Invalid entity type: '${entityType}'`);
	}
}
