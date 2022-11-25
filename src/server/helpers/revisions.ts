/*
 * Copyright (C) 2020 Prabal Singh
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

import * as error from '../../common/helpers/error';
import {camelCase, flatMap, pick, upperFirst} from 'lodash';
import {EntityType} from '../../client/entity-editor/relationship-editor/types';
import diff from 'deep-diff';


function getRevisionModels(orm) {
	const {AuthorRevision, EditionRevision, EditionGroupRevision, PublisherRevision, SeriesRevision, WorkRevision} = orm;
	return [
		AuthorRevision,
		EditionGroupRevision,
		EditionRevision,
		PublisherRevision,
		SeriesRevision,
		WorkRevision
	];
}

interface EntityProps {
	bbid: string;
	defaultAlias?: string;
	parentAlias?: string;
	type: any;
}

/* eslint-disable no-await-in-loop */
/**
 * Fetches the entities affected by a revision, their alias
 * or in case of deleted entities their last know alias.
 * It then attaches the necessary information to each revisions's entities array
 *
 * @param {array} revisions - the array of revisions
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - The modified revisions array
 */
export async function getAssociatedEntityRevisions(revisions, orm) {
	const revisionIDs = revisions.map(({revisionId}) => revisionId);
	const RevisionModels = getRevisionModels(orm);
	const {Entity} = orm;
	for (let i = 0; i < RevisionModels.length; i++) {
		const EntityRevision = RevisionModels[i];
		const entityRevisions = await new EntityRevision()
			.query((qb) => {
				qb.whereIn('id', revisionIDs);
			})
			.fetchAll({
				merge: false,
				remove: false,
				require: false,
				withRelated: [
					'data.aliasSet.defaultAlias'
				]
			})
			.catch(EntityRevision.NotFoundError, (err) => {
				// eslint-disable-next-line no-console
				console.log(err);
			});
		if (entityRevisions && entityRevisions.length) {
			const entityRevisionsJSON = entityRevisions.toJSON();
			for (let index = 0; index < entityRevisionsJSON.length; index++) {
				const entityRevision = entityRevisionsJSON[index];
				const entity = await new Entity({bbid: entityRevision.bbid}).fetch();
				const type = entity.get('type');
				const bbid = entity.get('bbid');
				const entityProps: EntityProps = {bbid, type};
				if (entityRevision.data) {
					entityProps.defaultAlias = entityRevision.data.aliasSet.defaultAlias;
				}
				// Fetch the parent alias only if data property is nullish, i.e. it is deleted
				else {
					entityProps.parentAlias = await orm.func.entity.getEntityParentAlias(orm, type, bbid);
				}
				// Find the revision by id and attach the current entity to it
				const revisionIndex = revisions.findIndex(rev => rev.revisionId === entityRevision.id);
				revisions[revisionIndex].entities.push(entityProps);
			}
		}
	}
	return revisions;
}

/**
 * Fetches revisions for Show All Revisions/Index Page
 * Fetches the last 'size' number of revisions with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last revisions required
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {array} - orderedRevisions
 */
export async function getOrderedRevisions(from, size, orm) {
	const {Revision} = orm;
	const revisions = await new Revision().orderBy('created_at', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withRelated: [
				'author'
			]
		});
	const revisionsJSON = revisions.toJSON();

	/* Massage the revisions to match the expected format */
	const formattedRevisions = revisionsJSON.map(rev => {
		delete rev.authorId;
		const {author: editor, id: revisionId, ...otherProps} = rev;
		return {editor, entities: [], revisionId, ...otherProps};
	});

	/* Fetch associated ${entity}_revisions and last know alias for deleted entities */
	return getAssociatedEntityRevisions(formattedRevisions, orm);
}

/**
 * Fetches revisions for an Editor
 * Fetches the last 'size' revisions with offset 'from'
 *
 * @param {number} from - the offset value
 * @param {number} size - no. of last revisions required
 * @param {object} req - req is an object containing information about the HTTP request
 * @returns {array} - orderedRevisions for particular Editor
 * @description
 * This checks whether Editor is valid or not.
 * If Editor is valid then this extracts the revisions done by that editor;
 * and then add associated entities in that array;
 */
export async function getOrderedRevisionForEditorPage(from, size, req) {
	const {Editor, Revision} = req.app.locals.orm;

	// If editor isn't present, throw an error
	await new Editor({id: req.params.id})
		.fetch()
		.catch(Editor.NotFoundError, () => {
			throw new error.NotFoundError('Editor not found', req);
		});
	const revisions = await new Revision()
		.query('where', 'author_id', '=', parseInt(req.params.id, 10))
		.orderBy('created_at', 'DESC')
		.fetchPage({
			limit: size,
			offset: from,
			withRelated: [
				{
					'notes'(q) {
						q.orderBy('note.posted_at');
					}
				},
				'notes.author'
			]
		});
	const revisionsJSON = revisions.toJSON();
	const formattedRevisions = revisionsJSON.map(rev => {
		delete rev.authorId;
		const {author: editor, id: revisionId, ...otherProps} = rev;
		return {editor, entities: [], revisionId, ...otherProps};
	});

	const orderedRevisions = await getAssociatedEntityRevisions(formattedRevisions, req.app.locals.orm);
	return orderedRevisions;
}


/**
 * @name recursivelyGetMergedEntitiesBBIDs
 * @async
 * @param {*} orm - The BookshelfJS ORM object
 * @param {array} bbids - Array of target BBIDs we want to get the source BBID of (if they exist)
 * @returns {Promise<Array<string>>} - Returns a promise resolving to an recursed array of BBIDs containing all descendants
 * @description This recursive function fetches all the merged BBIDs that are pointing to an array of BBIDs
 * An example; if entity A was merged into entity B, BBID A will point to BBID B.
 * Now if entity B is merged in entity C, BBID B will point to BBID C.
 * To allow for reverting merges cleanly, BBID A still points to B and not C (trust me on this).
 * In order to fetch the complete history tree containing all three entities, we need to recursively check
 * if a source_bbid appears as a target_bbid in other rows.
 */
export async function recursivelyGetMergedEntitiesBBIDs(orm: any, bbids: string[]) {
	const returnValue: string[] = [];
	await Promise.all(bbids.map(async (bbid) => {
		let thisLevelBBIDs = await orm.bookshelf.knex
			.select('source_bbid')
			.from('bookbrainz.entity_redirect')
			.where('target_bbid', bbid);
			// Flatten the returned array of objects
		thisLevelBBIDs = flatMap(thisLevelBBIDs, 'source_bbid');
		const nextLevelBBIDs = await recursivelyGetMergedEntitiesBBIDs(orm, thisLevelBBIDs);
		returnValue.push(...thisLevelBBIDs, ...nextLevelBBIDs);
	}));
	return returnValue;
}

export async function getOrderedRevisionsForEntityPage(orm: any, from: number, size: number, RevisionModel, bbid: string) {
	const otherMergedBBIDs = await recursivelyGetMergedEntitiesBBIDs(orm, [bbid]);

	const revisions = await new RevisionModel()
		.query((qb) => {
			qb.distinct(`${RevisionModel.prototype.tableName}.id`, 'revision.created_at', 'data_id');
			qb.whereIn('bbid', [bbid, ...otherMergedBBIDs]);
			qb.join('bookbrainz.revision', `${RevisionModel.prototype.tableName}.id`, '=', 'bookbrainz.revision.id');
			qb.orderBy('revision.created_at', 'DESC');
		}).fetchPage({
			limit: size,
			offset: from,
			withRelated: [
				'revision.author',
				{
					'revision.notes'(q) {
						q.orderBy('note.posted_at');
					}
				},
				'revision.notes.author'
			]
		});

	const revisionsJSON = revisions ? revisions.toJSON() : [];
	return revisionsJSON.map(rev => {
		const {revision} = rev;
		const editor = revision.author;
		const revisionId = revision.id;
		const {dataId} = rev;
		delete revision.author;
		delete revision.authorId;
		delete revision.id;
		return {dataId, editor, revisionId, ...revision};
	});
}

const EntityTypes = ['Author',
	'Edition',
	'EditionGroup', 'Publisher', 'Work'];

function getEntityRevisionModel(type:EntityType, orm) {
	const entityType = upperFirst(camelCase(type));
	if (!EntityTypes.includes(entityType)) { return null; }
	return orm[`${entityType}Revision`];
}
function getEntityHeaderModel(type:EntityType, orm) {
	const entityType = upperFirst(camelCase(type));
	if (!EntityTypes.includes(entityType)) { return null; }
	return orm[`${entityType}Header`];
}
function getEntityDataModel(type:EntityType, orm) {
	if (!EntityTypes.includes(type)) { return null; }
	return orm[`${upperFirst(camelCase(type))}Data`];
}

/**
 * Fetches all related entity revisions for a particular revision
 * @param {number} revisionId - The revision ID to get the associated entities for
 * @param {Object} orm - The BookshelfJS ORM object
 * @param {Object} transacting - The BookshelfJS transaction object
 * @returns {Promise<Record<String,Array<Object>>>} - Returns a promise resolving to an object containing the associated entities for each type
 */
async function getAllRevisionEntity(revisionId:number, orm:any, transacting:any) {
	const revisions = {};
	const key = 'parents';
	for (const type of EntityTypes) {
		const entityRevisionModel = getEntityRevisionModel(type, orm);
		// eslint-disable-next-line no-await-in-loop
		const entityRevision = await entityRevisionModel.forge().where('id', revisionId).fetchAll({
			merge: false,
			remove: false,
			require: false,
			transacting
		});
		const RevisionModal = getEntityRevisionModel(type, orm);
		const typeRevisions = [];
		for (const entity of entityRevision.models) {
			// fetch parent of a revision
			const revisionParent = await entity.related('revision').fetch({require: false, transacting})
				.then((revision) => revision.related(key).fetch({require: false, transacting}))
				.then((entities) => entities.map((ety) => ety.get('id')))
				.then((entitiesId) => {
					if (entitiesId.length === 0) {
						return null;
					}
					return new RevisionModal()
						.where('bbid', entity.get('bbid'))
						.query('whereIn', 'id', entitiesId)
						.orderBy('id', 'DESC')
						.fetch({require: false, transacting, withRelated: ['data']});
				});
			const entityJSON = entity.toJSON();
			if (revisionParent) {
				entityJSON.parentRevision = revisionParent;
			}
			typeRevisions.push(entityJSON);
		}
		revisions[type] = typeRevisions;
	}
	return revisions;
}

/**
 * This is responsible for reverting revisions given start and end revision id.
 *
 * @param {number} fromRevisionID - The revision ID to start from
 * @param {number} toRevisionID - The revision ID to end at
 * @param {string} bbid - The BBID of the entity
 * @param {Object} revisionMap - Keeps track of last known revision
 * @param {Object} orm - The BookBrainz ORM
 * @param {Object} transacting - Bookshelf transaction object (must be in
 * progress)
 * @returns
 */

export async function recursivelyDoRevision(fromRevisionID:number, toRevisionID:number, bbid:string,
	revisionMap:Record<string, any>, orm:any, transacting:any) {
	if (fromRevisionID === toRevisionID) {
		return;
	}
	if (fromRevisionID < toRevisionID) {
		throw new Error('fromRevisionID should be greater than toRevisionID');
	}
	const effectedEntities = await getAllRevisionEntity(fromRevisionID, orm, transacting);
	let nextId:number;
	for (const type of EntityTypes) {
		const entityRevision = effectedEntities[type];
		let mergeToBBID = null;
		const mergeEffectedEntities = [];
		revisionMap[type] = revisionMap[type] || {};
		for (const revision of entityRevision) {
			if (revision.parentRevision) {
				revisionMap[type][revision.bbid] = revision.parentRevision;
			}
			if (revision.bbid === bbid) {
				nextId = revision.parentRevision ? revision.parentRevision.get('id') : null;
			}
			// handle merged entities
			if (revision.isMerge) {
				if (revision.dataId !== null) {
					 mergeToBBID = revision.bbid;
				}
				else {
					mergeEffectedEntities.push(revision);
				}
			}
		}
		// if merged revision, then update redirect table
		if (mergeToBBID !== null) {
			for (const revision of mergeEffectedEntities) {
				const sourceBbid = revision.bbid;
				await orm.bookshelf.knex('bookbrainz.entity_redirect')
					.transacting(transacting)
					.where('source_bbid', sourceBbid).where('target_bbid', mergeToBBID).del();
			}
		}
	}
	if (nextId) {
		await recursivelyDoRevision(nextId, toRevisionID, bbid, revisionMap, orm, transacting);
	}
}

/**
 *  This function is responsible diffing two revisions and returning the new id set
 * @param {number} oldRelationshipSetId - The relationship set ID to start from
 * @param {number} newRelationshipSetId - The relationship set ID to end at
 * @param {string} excludeBBID - The BBID of the entity to be excluded
 * @param {Object} orm - The BookBrainz ORM
 * @param {Object} transacting - Bookshelf transaction object (must be in
 * @returns {Promise<Object>} - Returns a promise resolving to an object containing the associated entities relationship set
 */
async function diffRelationships(oldRelationshipSetId, newRelationshipSetId, excludeBBID, orm, transacting) {
	const {RelationshipSet} = orm;
	const oldRelatonhips = !oldRelationshipSetId ? [] : (await new RelationshipSet({id: oldRelationshipSetId})
		.fetch({transacting, withRelated: ['relationships']})).toJSON().relationships;
	const newRelationships = !newRelationshipSetId ? [] : (await new RelationshipSet({id: newRelationshipSetId})
		.fetch({transacting, withRelated: ['relationships']})).toJSON().relationships;
	// diff relationships using deep diff
	const appliedDiffRels = [];
	// apply those diff to the old relationships
	diff.observableDiff(oldRelatonhips, newRelationships, (differ) => {
		// Apply all changes except to the name property...
		// either deleted or added excluded bbid present in either sourceBbid or targetBbid
		if (differ.kind === 'A') {
			if ((differ.item.kind === 'N' && (differ.item.rhs.sourceBbid === excludeBBID || differ.item.rhs.targetBbid === excludeBBID)) ||
			(differ.item.kind === 'D' && (differ.item.lhs.sourceBbid === excludeBBID || differ.item.lhs.targetBbid === excludeBBID))) {
				if (differ.item.kind === 'N') {
					const addedRelationship = differ.item.rhs;
					addedRelationship.isRemoved = true;
					appliedDiffRels.push(addedRelationship);
				}
				else {
					const deletedRelationship = differ.item.lhs;
					deletedRelationship.isAdded = true;
					appliedDiffRels.push(deletedRelationship);
				}
			}
		}
	  });
	  const cleanedRels = appliedDiffRels.map((rel) => pick(rel, ['typeId', 'sourceBbid', 'targetBbid', 'attributeSetId', 'isAdded', 'isRemoved']));
	  const nextRelSet = await orm.func.relationship.updateRelationshipSets(orm, transacting, null, cleanedRels);
	  return nextRelSet;
}

/**
 * This function is responsible for reverting revisions(undo only) from master to given target revision.
 * @param {number} targetRevisionId - The revision ID to end at
 * @param {string} mainBBID - The BBID of the entity
 * @param {number} authorId - The ID of the user who is reverting
 * @param {string} type - The type of entity
 * @param {Object} orm - The BookBrainz ORM
 * @param {Object} transacting - Bookshelf transaction object (must be in
 * @returns  {Promise<void>} - Returns a promise resolving to nothing
 */
export async function revertRevision(targetRevisionId:number, mainBBID:string, authorId:number, type:EntityType, orm, transacting) {
	// find current revision id
	const EntityHeader = getEntityHeaderModel(type, orm);
	const {Revision} = orm;
	const entityHeader = await new EntityHeader({bbid: mainBBID}).fetch({require: false, transacting});
	if (!entityHeader) {
		throw new Error('Entity not found');
	}
	const currentRevisionId = entityHeader.get('masterRevisionId');
	const revisionMap = {};
	await recursivelyDoRevision(currentRevisionId, targetRevisionId, mainBBID, revisionMap, orm, transacting);
	const parentRevisionIDs = new Set();
	// create a revision for reverting
	const revision = await new Revision({authorId}).save(null, {method: 'insert', transacting});
	for (const etype of EntityTypes) {
		const revisions = revisionMap[etype];
		const RevisionModal = getEntityRevisionModel(etype, orm);
		const EntityDataModel = getEntityDataModel(etype, orm);
		const TypeEntityHeader = getEntityHeaderModel(etype, orm);
		for (const bbid in revisions) {
			if (Object.prototype.hasOwnProperty.call(revisions, bbid)) {
				const revisionJSON = revisions[bbid].toJSON();
				let dataId = revisionJSON.data.id;
				// get current revision id
				const effectedHeader = await new TypeEntityHeader({bbid}).fetch({require: false, transacting});
				const mid = effectedHeader.get('masterRevisionId');
				parentRevisionIDs.add(mid);
				const currentRevision = (await new RevisionModal({id: mid}).fetch({withRelated: ['data']})).toJSON();
				const oldRelSetID = revisionJSON.data.relationshipSetId;
				const newRelSetID = currentRevision?.data?.relationshipSetId;
				// if present relationship set doesn't matches with previous revision's relationship set then update it by creating new relationship set along with entity data
				if (newRelSetID !== oldRelSetID) {
					const diffRel = await diffRelationships(oldRelSetID, newRelSetID, mainBBID, orm, transacting);
					const newRelId = diffRel[bbid]?.get('id');
					const data = {...revisionJSON.data, relationshipSetId: newRelId};
					delete data.id;
					const newEntityData = await EntityDataModel.forge(data).save(null, {method: 'insert', transacting});
					dataId = newEntityData.get('id');
				}
				const revertRev = await new RevisionModal({bbid, dataId, id: revision.get('id')}).save(null, {method: 'insert', transacting});
				await new TypeEntityHeader({bbid}).save({masterRevisionId: revertRev.get('id')}, {method: 'update', transacting});
			}
		}
	}
	const parents = await revision.related('parents').fetch({transacting});
	await parents.attach([...parentRevisionIDs], {transacting});
}
