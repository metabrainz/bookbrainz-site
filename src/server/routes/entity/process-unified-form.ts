/* eslint-disable no-await-in-loop */
import * as achievement from '../../helpers/achievement';
import type {Request as $Request, Response as $Response} from 'express';
import {FormSubmissionError, sendErrorAsJSON} from '../../../common/helpers/error';
import {_bulkIndexEntities, getDocumentToIndex} from '../../../common/helpers/search';
import {authorToFormState, transformNewForm as authorTransform} from './author';
import {editionGroupToFormState, transformNewForm as editionGroupTransform} from './edition-group';
import {editionToFormState, transformNewForm as editionTransform} from './edition';
import {publisherToFormState, transformNewForm as publisherTransform} from './publisher';
import {seriesToFormState, transformNewForm as seriesTransform} from './series';

import {workToFormState, transformNewForm as workTransform} from './work';
import type {
	EntityTypeString
} from 'bookbrainz-data/lib/types/entity';
import _ from 'lodash';
import log from 'log';
import {processSingleEntity} from './entity';


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
		'formatId', 'statusId', 'creditSection'
	],
	editionGroup: ['typeid', 'creditSection'],
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
		const isNew = _.get(currentForm, '__isNew__', true);
		// if new entity, no need to process further
		if (!isNew && id) {
			const entityType = _.upperFirst(_.camelCase(type));
			// fetch the entity with all related attributes from the database
			const currentEntity = await orm.func.entity.getEntity(orm, entityType, id, getEntityRelations(entityType as EntityTypeString));
			currentEntity.relationships = [];
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


export async function handleCreateMultipleEntities(
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
	} | null | undefined;


	const {body}: {body: Record<string, any>} = req;
	async function processEntity(entityKey:string) {
		const entityForm = body[entityKey];
		const entityType = _.upperFirst(entityForm.type);
		const deriveProps = _.pick(entityForm, additionalEntityProps[_.camelCase(entityType)]);
		const isNew = _.get(entityForm, '__isNew__', true);
		currentEntity = null;
		if (!isNew) {
			currentEntity = await orm.func.entity.getEntity(orm, entityType, entityForm.id, getEntityRelations(entityType as EntityTypeString));
			if (!currentEntity) {
				throw new FormSubmissionError('Entity with given id not found');
			}
		}
		const {bookshelf} = orm;
		const entityEditPromise = bookshelf.transaction((transacting) =>
			processSingleEntity(entityForm, currentEntity, null, entityType, orm, editorJSON, deriveProps, false, transacting));
		return entityEditPromise;
	}
	// first, process all entities
	const processedEntities = [];
	const processedAchievements = [];
	try {
		for (const entityKey in body) {
			if (Object.prototype.hasOwnProperty.call(body, entityKey)) {
				processedEntities.push(await processEntity(entityKey));
			}
		}
	}
	catch (err) {
		log.error(err);
		return sendErrorAsJSON(res, err);
	}
	// log achievements error if any
	try {
		for (const entity of processedEntities) {
			const achievementPromise = processAchievement(orm, editorJSON.id, entity);
			processedAchievements.push(await achievementPromise);
		}
	}
	catch (err) {
		log.error(err);
	}
	// log indexing error if any
	try {
		_bulkIndexEntities(processedEntities.map(en => getDocumentToIndex(en, en.get('type'))));
	}
	catch (err) {
		log.error(err);
	}
	return res.send(processedEntities);
}
