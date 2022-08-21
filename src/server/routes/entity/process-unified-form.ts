import * as achievement from '../../helpers/achievement';
import * as handler from '../../helpers/handler';
import type {Request as $Request, Response as $Response} from 'express';
import {authorToFormState, transformNewForm as authorTransform} from './author';
import {editionGroupToFormState, transformNewForm as editionGroupTransform} from './edition-group';
import {editionToFormState, transformNewForm as editionTransform} from './edition';
import {
	fetchEntitiesForRelationships, fetchOrCreateMainEntity,
	getNextRelationshipSets, processSingleEntity, saveEntitiesAndFinishRevision
} from './entity';
import {publisherToFormState, transformNewForm as publisherTransform} from './publisher';
import {seriesToFormState, transformNewForm as seriesTransform} from './series';

import {workToFormState, transformNewForm as workTransform} from './work';
import type {
	EntityTypeString
} from 'bookbrainz-data/lib/func/types';
import {FormSubmissionError} from '../../../common/helpers/error';
import _ from 'lodash';
import {_bulkIndexEntities} from '../../../common/helpers/search';
import {addRelationships} from '../../helpers/middleware';


type PassportRequest = $Request & {user: any, session: any};
const transformFunctions = {
	author: authorTransform,
	edition: editionTransform,
	editionGroup: editionGroupTransform,
	publisher: publisherTransform,
	series: seriesTransform,
	work: workTransform
};
const additionalEntityProps = {
	author: [
		'typeId', 'genderId', 'beginAreaId', 'beginDate', 'endDate', 'ended',
		'endAreaId'
	],
	edition: [
		'editionGroupBbid', 'width', 'height', 'depth', 'weight', 'pages',
		'formatId', 'statusId'
	],
	editionGroup: 'typeid',
	publisher: ['typeId', 'areaId', 'beginDate', 'endDate', 'ended'],
	series: ['entityType', 'orderingTypeId'],
	work: 'typeId'

};

const entityToFormStateMap = {
	author: authorToFormState,
	edition: editionToFormState,
	editionGroup: editionGroupToFormState,
	publisher: publisherToFormState,
	series: seriesToFormState,
	work: workToFormState
};

const baseRelations = [
	'aliasSet.aliases.language',
	'annotation.lastRevision',
	'defaultAlias',
	'disambiguation',
	'identifierSet.identifiers.type',
	'relationshipSet.relationships.type',
	'revision.revision',
	'collections.owner'
];

const additionalEntityAttributes = {
	author: ['authorType', 'gender', 'beginArea', 'endArea'],
	edition: [
		'authorCredit.names.author.defaultAlias',
		'editionGroup.defaultAlias',
		'languageSet.languages',
		'editionFormat',
		'editionStatus',
		'releaseEventSet.releaseEvents',
		'publisherSet.publishers.defaultAlias'
	],
	editionGroup: [
		'authorCredit.names.author.defaultAlias',
		'editionGroupType',
		'editions.defaultAlias',
		'editions.disambiguation',
		'editions.releaseEventSet.releaseEvents',
		'editions.identifierSet.identifiers.type',
		'editions.editionFormat'
	],
	publisher: ['publisherType', 'area'],
	series: [
		'defaultAlias',
		'disambiguation',
		'seriesOrderingType',
		'identifierSet.identifiers.type'
	],
	work: ['workType', 'languageSet.languages']
};

export async function processAchievement(orm, editorId, entityJSON) {
	const {revisionId} = entityJSON;
	try {
		const achievementUnlock = await achievement.processEdit(orm, editorId, revisionId);
		if (achievementUnlock.alert) {
			entityJSON.alert = achievementUnlock.alert;
		}
		return entityJSON;
	}
	catch (err) {
		return Promise.reject(new Error(err));
	}
}

function getEntityRelations(type:EntityTypeString) {
	return [...baseRelations, ...additionalEntityAttributes[_.camelCase(type)]];
}

export function transformForm(body:Record<string, any>):Record<string, any> {
	return _.mapValues(body, (currentForm) => {
		const transformedForm = transformFunctions[_.camelCase(currentForm.type)](currentForm);
		const __isNew__ = _.get(currentForm, '__isNew__', true);
		const {id, type} = currentForm;
		return {__isNew__, id, type, ...transformedForm};
	});
}

export async function preprocessForm(body:Record<string, any>, orm):Promise<Record<string, any>> {
	async function processForm(currentForm) {
		const {id, type} = currentForm;
		const {RelationshipSet} = orm;
		const isNew = _.get(currentForm, '__isNew__', true);
		// if new entity, no need to process further
		if (!isNew && id) {
			const entityType = _.upperFirst(_.camelCase(type));
			// fetch the entity with all related attributes from the database
			const currentEntity = await orm.func.entity.getEntity(orm, entityType, id, getEntityRelations(entityType as EntityTypeString));
			// since relationship will not be set by default, we need to add it manually
			const relationshipSet = await RelationshipSet.forge({id: currentEntity.relationshipSetId}).fetch({
				require: false,
				withRelated: [
					'relationships.source',
					'relationships.target',
					'relationships.type.attributeTypes',
					'relationships.attributeSet.relationshipAttributes.value',
					'relationships.attributeSet.relationshipAttributes.type'
				]
			});
			await addRelationships(currentEntity, relationshipSet, orm);
			if (!currentEntity.annotation) {
				_.set(currentEntity, ['annotation', 'content'], '');
			}
			// convert this state to normal entity-editor state
			const oldFormState = entityToFormStateMap[_.camelCase(type)](currentEntity);
			// deep merge the old state with new one
			return _.merge(oldFormState, currentForm);
		}
		return currentForm;
	}
	const allEntities = await Promise.all(_.values(body).map(processForm));
	return Object.fromEntries(Object.keys(body).map((key, index) => [key, allEntities[index]]));
}

export async function handleAddRelationship(
	body:Record<string, any>,
	editorId:number,
	currentEntity,
	entityType:EntityTypeString,
	orm,
	transacting
) {
	const {Revision} = orm;

	// new revision for adding relationship
	const newRevision = await new Revision({
		authorId: editorId,
		isMerge: false
	}).save(null, {transacting});
	const relationshipSets = await getNextRelationshipSets(
		orm, transacting, currentEntity, body
	);
	if (_.isEmpty(relationshipSets)) {
		return {};
	}
	// Fetch main entity
	const mainEntity = await fetchOrCreateMainEntity(
		orm, transacting, false, currentEntity.bbid, entityType
	);

	// Fetch all entities that definitely exist
	const otherEntities = await fetchEntitiesForRelationships(
		orm, transacting, currentEntity, relationshipSets
	);
	otherEntities.forEach(entity => { entity.shouldInsert = false; });
	mainEntity.shouldInsert = false;
	const allEntities = [...otherEntities, mainEntity]
		.filter(entity => entity.get('dataId') !== null);
	_.forEach(allEntities, (entityModel) => {
		const bbid: string = entityModel.get('bbid');
		if (_.has(relationshipSets, bbid)) {
			entityModel.set(
				'relationshipSetId',
				// Set to relationshipSet id or null if empty set
				relationshipSets[bbid] && relationshipSets[bbid].get('id')
			);
		}
	});
	const savedMainEntity = await saveEntitiesAndFinishRevision(
		orm, transacting, false, newRevision, mainEntity, allEntities,
		editorId, body.note
	);
	return savedMainEntity.toJSON();
}

export function handleCreateMultipleEntities(
	req: PassportRequest,
	res: $Response
) {
	const {orm}: {orm?: any} = req.app.locals;
	const editorJSON = req.user;
	let currentEntity: {
		__isNew__: boolean | undefined,
		aliasSet: {id: number} | null | undefined,
		annotation: {id: number} | null | undefined,
		bbid: string,
		disambiguation: {id: number} | null | undefined,
		identifierSet: {id: number} | null | undefined,
		type: EntityTypeString
	} | null | undefined = null;


	const {body}: {body: Record<string, any>} = req;
	async function processEntity(entityKey:string) {
		const entityForm = body[entityKey];
		const entityType = _.upperFirst(entityForm.type);
		const deriveProps = _.pick(entityForm, additionalEntityProps[_.camelCase(entityType)]);
		const isNew = _.get(entityForm, '__isNew__', true);
		if (!isNew) {
			currentEntity = await orm.func.entity.getEntity(orm, entityType, entityForm.id, getEntityRelations(entityType as EntityTypeString));
			if (!currentEntity) {
				throw new FormSubmissionError('Entity with given id not found');
			}
		}
		// edition entity should be on the bottom of the list
		return processSingleEntity(entityForm, currentEntity, null, entityType, orm, editorJSON, deriveProps, false);
	}
	// create all entities
	const achievementPromise = Promise.all(_.keys(body).map(processEntity));
	return handler.sendPromiseResult(
		res,
		achievementPromise,
		_bulkIndexEntities
	);
}
