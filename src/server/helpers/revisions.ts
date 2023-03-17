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
import {flatMap} from 'lodash';


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
async function recursivelyGetMergedEntitiesBBIDs(orm: any, bbids: string[]) {
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
			qb.distinct(`${RevisionModel.prototype.tableName}.id`, 'revision.created_at');
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
		delete revision.author;
		delete revision.authorId;
		delete revision.id;
		return {editor, revisionId, ...revision};
	});
}

