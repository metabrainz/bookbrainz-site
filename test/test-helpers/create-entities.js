/*
 * Copyright (C) 2019  Nicolas Pelletier
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

import orm from '../bookbrainz-data';
// eslint-disable-next-line import/no-internal-modules
import uuidv4 from 'uuid/v4';


const {
	bookshelf, util, Editor, EditorType, Revision, RelationshipSet,
	Alias, AliasSet, Identifier, IdentifierType, IdentifierSet,
	Disambiguation, Entity, Annotation, Gender,
	Author, Edition, EditionGroup, Publisher, Work
} = orm;

const setData = {id: 1};

export const editorTypeAttribs = {
	id: 1,
	label: 'test_type'
};

export const editorAttribs = {
	cachedMetabrainzName: 'Bob',
	genderId: 1,
	id: 1,
	metabrainzUserId: 1,
	name: 'bob',
	revisionsApplied: 0,
	typeId: 1
};

const aliasData = {
	...setData,
	name: 'work name',
	sortName: 'Work sort name'
};

const identifierData = {
	...setData,
	typeId: 1,
	value: 'Q123456'
};

const revisionAttribs = {
	authorId: 1,
	id: 1
};

const identifierTypeData = {
	description: 'test',
	displayTemplate: 'test',
	entityType: 'Work',
	...setData,
	label: 'test',
	validationRegex: 'test'
};

const entityAttribs = {
	aliasSetId: 1,
	annotationId: 1,
	// bbid should normally be overwritten when calling create{Entity}
	bbid: uuidv4(),
	disambiguationId: 1,
	identifierSetId: 1,
	relationshipSetId: 1,
	revisionId: 1
};

export async function createEditor() {
	await new EditorType(editorTypeAttribs)
		.save(null, {method: 'insert'});
	await new Gender({...setData, name: 'test'})
		.save(null, {method: 'insert'});
	await new Editor(editorAttribs)
		.save(null, {method: 'insert'});
}

async function createAliasAndAliasSet() {
	await new Alias(aliasData)
		.save(null, {method: 'insert'});
	await new AliasSet({...setData, defaultAliasId: 1})
		.save(null, {method: 'insert'});
}
async function createIdentifierAndIdentifierSet() {
	await new IdentifierType(identifierTypeData)
		.save(null, {method: 'insert'});
	await new IdentifierSet(setData)
		.save(null, {method: 'insert'});
	await new Identifier(identifierData)
		.save(null, {method: 'insert'});
}
async function createRelationshipSet() {
	// Create relationships here if you need them
	await new RelationshipSet(setData)
		.save(null, {method: 'insert'});
}

export function getRandomUUID() {
	return uuidv4();
}

async function createEntityPrerequisites() {
	await createEditor();
	await createAliasAndAliasSet();
	await createIdentifierAndIdentifierSet();
	await createRelationshipSet();

	await new Disambiguation({
		...setData,
		comment: 'Test Disambiguation'
	})
		.save(null, {method: 'insert'});
	await new Revision(revisionAttribs)
		.save(null, {method: 'insert'});
	await new Annotation({
		...setData,
		content: 'Test Annotation',
		lastRevisionId: 1
	})
		.save(null, {method: 'insert'});
}

export async function createEdition(optionalBBID) {
	const bbid = optionalBBID || uuidv4();

	await createEntityPrerequisites();

	await new Entity({bbid, type: 'Edition'})
		.save(null, {method: 'insert'});
	await new Edition({...entityAttribs, bbid})
		.save(null, {method: 'insert'});
}

export async function createWork(optionalBBID) {
	const bbid = optionalBBID || uuidv4();

	await createEntityPrerequisites();

	await new Entity({bbid, type: 'Work'})
		.save(null, {method: 'insert'});
	await new Work({...entityAttribs, bbid})
		.save(null, {method: 'insert'});
}

export function truncateEntities() {
	return util.truncateTables(bookshelf, [
		'bookbrainz.editor',
		'bookbrainz.editor_type',
		'bookbrainz.alias',
		'bookbrainz.alias_set',
		'bookbrainz.identifier',
		'bookbrainz.identifier_set',
		'bookbrainz.identifier_type',
		'bookbrainz.relationship',
		'bookbrainz.relationship_set',
		'bookbrainz.disambiguation',
		'bookbrainz.entity',
		'bookbrainz.revision',
		'bookbrainz.annotation',
		'bookbrainz.author',
		'bookbrainz.edition',
		'bookbrainz.edition_group',
		'bookbrainz.publisher',
		'bookbrainz.work',
		'musicbrainz.gender'
	]);
}
