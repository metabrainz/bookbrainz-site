/* eslint-disable no-console */
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

import {internet, random} from 'faker';
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

const languageAttribs = {
	frequency: 1,
	id: 1,
	isoCode1: 'en',
	isoCode2b: 'eng',
	isoCode2t: 'eng',
	isoCode3: 'eng',
	name: 'English'
};

const aliasData = {
	...setData,
	languageId: 42,
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
const authorTypeAttribs = {
	id: random.number()
};

export function createEditor(editorId) {
	return orm.bookshelf.knex.transaction(async (transacting) => {
		editorTypeAttribs.id = random.number();
		await new EditorType(editorTypeAttribs)
			.save(null, {method: 'insert', transacting});
		const gender = await new Gender({...setData, id: random.number(), name: 'test'})
			.save(null, {method: 'insert', transacting});

		editorAttribs.id = editorId || random.number();
		editorAttribs.genderId = gender.get('id');
		editorAttribs.typeId = editorTypeAttribs.id;
		editorAttribs.name = internet.userName();
		editorAttribs.metabrainzUserId = random.number();
		editorAttribs.cachedMetabrainzName = editorAttribs.name;

		const editor = await new Editor(editorAttribs)
			.save(null, {method: 'insert', transacting});
		return editor;
	});
}

async function createAliasAndAliasSet() {
	aliasData.languageId = random.number();
	await new Language({...languageAttribs, id: aliasData.languageId})
		.save(null, {method: 'insert'})
		.catch(console.log);
	const alias = await new Alias({...aliasData, id: random.number()})
		.save(null, {method: 'insert'});

	entityAttribs.aliasSetId = random.number();
	await new AliasSet({
		defaultAliasId: alias.get('id'),
		id: entityAttribs.aliasSetId
	})
		.save(null, {method: 'insert'})
		.then((model) => model.aliases().attach([alias]));
}

async function createIdentifierAndIdentifierSet() {
	identifierTypeData.id = random.number();
	await new IdentifierType(identifierTypeData)
		.save(null, {method: 'insert'})
		.catch(console.log);

	identifierData.typeId = identifierTypeData.id;
	const identifier = await new Identifier({...identifierData, id: random.number()})
		.save(null, {method: 'insert'});

	entityAttribs.identifierSetId = random.number();
	await new IdentifierSet({id: entityAttribs.identifierSetId})
		.save(null, {method: 'insert'})
		.then((model) => model.identifiers().attach([identifier]));
}

async function createRelationshipSet(sourceBbid, targetBbid, targetEntityType = 'Author') {
	const safeTargetBbid = targetBbid || uuidv4();
	const safeSourceBbid = sourceBbid || uuidv4();

	/* Create the relationship target entity */
	await new Entity({bbid: safeTargetBbid, type: targetEntityType})
		.save(null, {method: 'insert'});
	const EntityModel = orm[`${targetEntityType}`];
	const revisionId = random.number();
	await new Revision({authorId: editorAttribs.id, id: revisionId})
		.save(null, {method: 'insert'});
	await new EntityModel({
		aliasSetId: entityAttribs.aliasSetId, bbid: safeTargetBbid, revisionId
	}).save(null, {method: 'insert'});

	const relationshipData = {
		id: 1,
		sourceBbid: safeSourceBbid,
		targetBbid: safeTargetBbid,
		typeId: 1
	};
	relationshipTypeData.id = random.number();
	await new RelationshipType(relationshipTypeData)
		.save(null, {method: 'insert'})
		.catch(console.log);

	relationshipData.typeId = relationshipTypeData.id;
	relationshipData.id = random.number();
	const relationship = await new Relationship(relationshipData)
		.save(null, {method: 'insert'});

	entityAttribs.relationshipSetId = random.number();
	await new RelationshipSet({id: entityAttribs.relationshipSetId})
		.save(null, {method: 'insert'})
		.then(
			(model) =>
				model.relationships().attach([relationship]).then(() => model)
		);
}


async function createLanguageSet() {
	// Create relationships here if you need them
	const language1Id = random.number();
	const language2Id = random.number();
	await new Language({...languageAttribs, id: language1Id})
		.save(null, {method: 'insert'});
	await new Language({...languageAttribs, id: language2Id})
		.save(null, {method: 'insert'});
	const languageSet = await updateLanguageSet(
		orm,
		null,
		null,
		[{id: language1Id}, {id: language2Id}]
	);
	return languageSet.get('id');
}

export function getRandomUUID() {
	return uuidv4();
}

async function createEntityPrerequisites(entityBbid, entityType) {
	await createEditor();
	await createAliasAndAliasSet();
	await createIdentifierAndIdentifierSet();
	await createRelationshipSet(entityBbid, null, entityType);

	const disambiguation = await new Disambiguation({
		comment: 'Test Disambiguation',
		id: random.number()
	})
		.save(null, {method: 'insert'});
	entityAttribs.disambiguationId = disambiguation.get('id');

	revisionAttribs.id = random.number();
	revisionAttribs.authorId = editorAttribs.id;
	await new Revision(revisionAttribs)
		.save(null, {method: 'insert'});
	entityAttribs.revisionId = revisionAttribs.id;

	entityAttribs.annotationId = random.number();
	await new Annotation({
		content: 'Test Annotation',
		id: entityAttribs.annotationId,
		lastRevisionId: revisionAttribs.id
	})
		.save(null, {method: 'insert'});
}

export async function createEdition(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Edition'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Edition');

	const edition = await new Edition({...entityAttribs, bbid})
		.save(null, {method: 'insert'});
	return edition;
}

export async function createWork(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Work'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Work');
	const languageSetId = await createLanguageSet();

	const workAttribs = {
		bbid,
		languageSetId,
		typeId: random.number()
	};
	await new WorkType({id: workAttribs.typeId, label: `Work Type ${workAttribs.typeId}`})
		.save(null, {method: 'insert'});
	const work = await new Work({...entityAttribs, ...workAttribs})
		.save(null, {method: 'insert'});
	return work;
}

export async function createEditionGroup(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'EditionGroup'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'EditionGroup');
	const editionGroupAttribs = {
		bbid,
		typeId: random.number()
	};
	await new EditionGroupType({id: editionGroupAttribs.typeId, label: `Edition Group Type ${editionGroupAttribs.typeId}`})
		.save(null, {method: 'insert'});
	const editionGroup = await new EditionGroup({...entityAttribs, ...editionGroupAttribs})
		.save(null, {method: 'insert'});
	return editionGroup;
}

export async function createAuthor(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Author'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Author');
	const areaId = random.number();
	const authorAttribs = {
		bbid,
		beginAreaId: areaId,
		beginDay: 25,
		beginMonth: 12,
		beginYear: 2000,
		endAreaId: areaId,
		endDay: 10,
		endMonth: 5,
		endYear: 2012,
		ended: true,
		genderId: editorAttribs.genderId,
		typeId: authorTypeAttribs.id
	};
	await new Area({gid: uuidv4(), id: areaId, name: 'Rlyeh'})
		.save(null, {method: 'insert'});
	// Front-end requires 'Person' and 'Group' types
	try {
		await new AuthorType({id: authorTypeAttribs.id, label: 'Person'})
			.save(null, {method: 'insert'});
	}
	catch (error) {
		// Type already exists
	}
	try {
		await new AuthorType({id: random.number(), label: 'Group'})
			.save(null, {method: 'insert'});
	}
	catch (error) {
		// Type already exists
	}
	const author = await new Author({...entityAttribs, ...authorAttribs})
		.save(null, {method: 'insert'});
	return author;
}

export async function createPublisher(optionalBBID) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Publisher'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Publisher');
	const publisherAttribs = {
		areaId: random.number(),
		bbid,
		beginDay: 25,
		beginMonth: 12,
		beginYear: 2000,
		endDay: 10,
		endMonth: 5,
		endYear: 2012,
		ended: true,
		typeId: random.number()
	};
	await new Area({gid: uuidv4(), id: publisherAttribs.areaId, name: 'Rlyeh'})
		.save(null, {method: 'insert'});
	await new PublisherType({id: publisherAttribs.typeId, label: `Publisher Type ${publisherAttribs.typeId}`})
		.save(null, {method: 'insert'});
	const publisher = await new Publisher({...entityAttribs, ...publisherAttribs})
		.save(null, {method: 'insert'});
	return publisher;
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
