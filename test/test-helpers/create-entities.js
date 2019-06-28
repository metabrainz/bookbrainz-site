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
	bookshelf, util, Editor, EditorType, Revision, Relationship, RelationshipType, RelationshipSet,
	Alias, AliasSet, Area, Identifier, IdentifierType, IdentifierSet,
	Disambiguation, Entity, Annotation, Gender,
	Author, Edition, EditionGroup, Publisher, Work,
	Language, WorkType, EditionGroupType, AuthorType, PublisherType
} = orm;
const {updateLanguageSet} = orm.func.language;


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

const relationshipTypeData = {
	description: 'test descryption',
	id: 1,
	label: 'test label',
	linkPhrase: 'test phrase',
	reverseLinkPhrase: 'test reverse link phrase',
	sourceEntityType: 'Author',
	targetEntityType: 'Work'
};

const relationshipData = {
	id: 1,
	sourceBbid: uuidv4(),
	targetBbid: uuidv4(),
	typeId: 1
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
	await new RelationshipType(relationshipTypeData)
		.save(null, {method: 'insert'});
	await new RelationshipSet(setData)
		.save(null, {method: 'insert'});
	await new Relationship(relationshipData)
		.save(null, {method: 'insert'});
}
const languageAttribs = {
	frequency: 1,
	id: 1,
	isoCode1: 'en',
	isoCode2b: 'eng',
	isoCode2t: 'eng',
	isoCode3: 'eng',
	name: 'English'
};

async function createLanguageSet() {
	// Create relationships here if you need them
	await new Language(languageAttribs)
		.save(null, {method: 'insert'});
	await new Language({...languageAttribs, id: 2})
		.save(null, {method: 'insert'});
	const languageSet = await updateLanguageSet(
		orm,
		null,
		null,
		[{id: 1}, {id: 2}]
	);
	return languageSet.get('id');
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
	const languageSetId = await createLanguageSet();

	const workAttribs = {
		bbid,
		languageSetId,
		typeId: setData.id
	};
	await new WorkType({...setData, label: 'Work Type 1'})
		.save(null, {method: 'insert'});
	await new Entity({bbid, type: 'Work'})
		.save(null, {method: 'insert'});
	await new Work({...entityAttribs, ...workAttribs})
		.save(null, {method: 'insert'});
}

export async function createEditionGroup(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await createEntityPrerequisites();
	const editionGroupAttribs = {
		bbid,
		typeId: setData.id
	};
	await new EditionGroupType({...setData, label: 'Edition Group Type 1'})
		.save(null, {method: 'insert'});
	await new Entity({bbid, type: 'EditionGroup'})
		.save(null, {method: 'insert'});
	await new EditionGroup({...entityAttribs, ...editionGroupAttribs})
		.save(null, {method: 'insert'});
}

export async function createAuthor(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await createEntityPrerequisites();
	const authorAttribs = {
		bbid,
		beginAreaId: setData.id,
		beginDay: 25,
		beginMonth: 12,
		beginYear: 2000,
		endAreaId: setData.id,
		endDay: 10,
		endMonth: 5,
		endYear: 2012,
		ended: true,
		genderId: setData.id,
		typeId: setData.id
	};
	await new Area({...setData, gid: uuidv4(), name: 'Rlyeh'})
		.save(null, {method: 'insert'});
	await new AuthorType({...setData, label: 'Author Type 1'})
		.save(null, {method: 'insert'});
	await new Entity({bbid, type: 'Author'})
		.save(null, {method: 'insert'});
	await new Author({...entityAttribs, ...authorAttribs})
		.save(null, {method: 'insert'});
}

export async function createPublisher(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await createEntityPrerequisites();
	const publisherAttribs = {
		areaId: setData.id,
		bbid,
		beginDay: 25,
		beginMonth: 12,
		beginYear: 2000,
		endDay: 10,
		endMonth: 5,
		endYear: 2012,
		ended: true,
		typeId: setData.id
	};
	await new Area({...setData, gid: uuidv4(), name: 'Rlyeh'})
		.save(null, {method: 'insert'});
	await new PublisherType({...setData, label: 'Publisher Type 1'})
		.save(null, {method: 'insert'});
	await new Entity({bbid, type: 'Publisher'})
		.save(null, {method: 'insert'});
	await new Publisher({...entityAttribs, ...publisherAttribs})
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
		'bookbrainz.relationship_type',
		'bookbrainz.relationship_set',
		'bookbrainz.disambiguation',
		'bookbrainz.entity',
		'bookbrainz.revision',
		'bookbrainz.annotation',
		'bookbrainz.work_type',
		'bookbrainz.edition_group_type',
		'bookbrainz.author_type',
		'bookbrainz.publisher_type',
		'musicbrainz.area',
		'musicbrainz.language',
		'musicbrainz.gender'
	]);
}
