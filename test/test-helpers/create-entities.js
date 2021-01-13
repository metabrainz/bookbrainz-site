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

import {isNil} from 'lodash';
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


export const editorTypeAttribs = {
	label: 'test_type'
};

export const editorAttribs = {
	cachedMetabrainzName: 'Bob',
	genderId: 1,
	metabrainzUserId: 1,
	name: 'bob',
	revisionsApplied: 0,
	typeId: 1
};

const languageAttribs = {
	frequency: 1,
	isoCode1: 'en',
	isoCode2b: 'eng',
	isoCode2t: 'eng',
	isoCode3: 'eng',
	name: 'English'
};

export const aliasData = {
	languageId: 42,
	name: 'Entity name',
	sortName: 'Entity sort name'
};

const identifierData = {
	value: 'Q123456'
};

const revisionAttribs = {authorId: 1};
const identifierTypeData = {
	description: 'test',
	displayTemplate: 'test',
	entityType: 'Work',
	label: 'test',
	validationRegex: 'test'
};

const relationshipTypeData = {
	description: 'test descryption',
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

export function createEditor(editorId) {
	return orm.bookshelf.knex.transaction(async (transacting) => {
		const editorType = await new EditorType(editorTypeAttribs)
			.save(null, {method: 'insert', transacting});
		const gender = await new Gender({name: 'test'})
			.save(null, {method: 'insert', transacting});

		editorAttribs.id = editorId || random.number();
		editorAttribs.genderId = gender.id;
		editorAttribs.typeId = editorType.id;
		editorAttribs.name = internet.userName();
		editorAttribs.metabrainzUserId = random.number();
		editorAttribs.cachedMetabrainzName = editorAttribs.name;

		const editor = await new Editor(editorAttribs)
			.save(null, {method: 'insert', transacting});
		return editor;
	});
}

async function createAliasAndAliasSet() {
	const language = await new Language({...languageAttribs})
		.save(null, {method: 'insert'})
		.catch(console.log);
	aliasData.languageId = language.id;
	const alias = await new Alias({...aliasData})
		.save(null, {method: 'insert'});

	const aliasSet = await new AliasSet({
		defaultAliasId: alias.id
	})
		.save(null, {method: 'insert'});
	entityAttribs.aliasSetId = aliasSet.id;
	await aliasSet.aliases().attach([alias.id]);
}

async function createIdentifierAndIdentifierSet() {
	const identifierType = await new IdentifierType(identifierTypeData)
		.save(null, {method: 'insert'})
		.catch(console.log);

	identifierData.typeId = identifierType.id;
	const identifier = await new Identifier(identifierData)
		.save(null, {method: 'insert'});

	const identifierSet = await new IdentifierSet()
		.save(null, {method: 'insert'});
	entityAttribs.identifierSetId = identifierSet.id;
	await identifierSet.identifiers().attach([identifier.id]);
}

async function createRelationshipSet(sourceBbid, targetBbid, targetEntityType = 'Author') {
	const safeTargetBbid = targetBbid || uuidv4();
	const safeSourceBbid = sourceBbid || uuidv4();

	/* Create the relationship target entity */
	await new Entity({bbid: safeTargetBbid, type: targetEntityType})
		.save(null, {method: 'insert'});
	const EntityModel = orm[`${targetEntityType}`];
	const revision = await new Revision({authorId: editorAttribs.id})
		.save(null, {method: 'insert'});
	await new EntityModel({
		aliasSetId: entityAttribs.aliasSetId, bbid: safeTargetBbid, revisionId: revision.id
	}).save(null, {method: 'insert'});


	const relationshipType = await new RelationshipType(relationshipTypeData)
		.save(null, {method: 'insert'})
		.catch(console.log);

	const relationshipData = {
		sourceBbid: safeSourceBbid,
		targetBbid: safeTargetBbid,
		typeId: relationshipType.id
	};
	const relationship = await new Relationship(relationshipData)
		.save(null, {method: 'insert'});

	const relationshipSet = await new RelationshipSet()
		.save(null, {method: 'insert'});
	entityAttribs.relationshipSetId = relationshipSet.id;
	await relationshipSet.relationships().attach([relationship.id]);
}


async function createLanguageSet() {
	// Create relationships here if you need them
	const language1 = await new Language(languageAttribs)
		.save(null, {method: 'insert'});
	const language2 = await new Language(languageAttribs)
		.save(null, {method: 'insert'});
	const languageSet = await updateLanguageSet(
		orm,
		null,
		null,
		[{id: language1.id}, {id: language2.id}]
	);
	return languageSet.id;
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
		comment: 'Test Disambiguation'
	})
		.save(null, {method: 'insert'});
	entityAttribs.disambiguationId = disambiguation.id;

	revisionAttribs.authorId = editorAttribs.id;
	const revision = await new Revision(revisionAttribs)
		.save(null, {method: 'insert'});
	entityAttribs.revisionId = revision.id;

	const annotation = await new Annotation({
		content: 'Test Annotation',
		lastRevisionId: revision.id
	})
		.save(null, {method: 'insert'});
	entityAttribs.annotationId = annotation.id;
}

export async function createEdition(optionalBBID, optionalEditionAttribs = {}) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Edition'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Edition');

	const edition = await new Edition({...entityAttribs, bbid, ...optionalEditionAttribs})
		.save(null, {method: 'insert'});
	return edition;
}

export async function createWork(optionalBBID, optionalWorkAttribs = {}) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Work'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Work');

	let languageSetId;
	if (!optionalWorkAttribs.languageSetId) {
		languageSetId = await createLanguageSet();
	}
	let workType;
	const optionalWorkTypeAttribs = {};
	if (!isNil(optionalWorkAttribs.typeId)) {
		optionalWorkTypeAttribs.id = optionalWorkAttribs.typeId;
		workType = await new WorkType({id: optionalWorkAttribs.typeId})
			.fetch({
				require: false
			});
	}

	if (!workType) {
		workType = await new WorkType({label: `Work Type ${optionalWorkAttribs.typeId || random.number()}`, ...optionalWorkTypeAttribs})
			.save(null, {method: 'insert'});
	}

	const workAttribs = {
		bbid,
		languageSetId,
		typeId: workType.id,
		...optionalWorkAttribs
	};
	const work = await new Work({...entityAttribs, ...workAttribs})
		.save(null, {method: 'insert'});
	return work;
}

export async function createEditionGroup(optionalBBID, optionalEditionGroupAttrib = {}) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'EditionGroup'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'EditionGroup');
	const optionalEditionGroupTypeAttrib = {};
	if (!isNil(optionalEditionGroupAttrib.typeId)) {
		optionalEditionGroupTypeAttrib.id = optionalEditionGroupAttrib.typeId;
	}
	const editionGroupType = await new EditionGroupType({label: `Edition Group Type ${optionalEditionGroupAttrib.typeId || random.number()}`, ...optionalEditionGroupTypeAttrib})
		.save(null, {method: 'insert'});

	const editionGroupAttribs = {
		bbid,
		typeId: editionGroupType.id,
		...optionalEditionGroupAttrib
	};
	const editionGroup = await new EditionGroup({...entityAttribs, ...editionGroupAttribs})
		.save(null, {method: 'insert'});
	return editionGroup;
}

export async function createAuthor(optionalBBID, optionalAuthorAttribs = {}) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Author'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Author');

	const area = await new Area({gid: uuidv4(), name: 'Rlyeh'})
		.save(null, {method: 'insert'});

	// Front-end requires 'Person' and 'Group' types
	try {
		await new AuthorType({id: 1, label: 'Person'})
			.save(null, {method: 'insert'});
	}
	catch (error) {
		// Type already exists
	}
	try {
		await new AuthorType({id: 2, label: 'Group'})
			.save(null, {method: 'insert'});
	}
	catch (error) {
		// Type already exists
	}

	const authorAttribs = {
		bbid,
		beginAreaId: area.id,
		beginDay: 25,
		beginMonth: 12,
		beginYear: 2000,
		endAreaId: area.id,
		endDay: 10,
		endMonth: 5,
		endYear: 2012,
		ended: true,
		genderId: editorAttribs.genderId,
		typeId: 1,
		...optionalAuthorAttribs
	};
	const author = await new Author({...entityAttribs, ...authorAttribs})
		.save(null, {method: 'insert'});
	return author;
}

export async function createPublisher(optionalBBID, optionalPublisherAttribs = {}) {
	const bbid = optionalBBID || uuidv4();
	await new Entity({bbid, type: 'Publisher'})
		.save(null, {method: 'insert'});
	await createEntityPrerequisites(bbid, 'Publisher');

	let area;
	const optionalAreaAttribs = {};
	if (!isNil(optionalPublisherAttribs.areaId)) {
		optionalAreaAttribs.id = optionalPublisherAttribs.areaId;
		area = await new Area({id: optionalPublisherAttribs.areaId})
			.fetch({require: false});
	}
	if (!area) {
		area = await new Area({gid: uuidv4(), name: `Area ${optionalPublisherAttribs.areaId || random.number()}`, ...optionalAreaAttribs})
			.save(null, {method: 'insert'});
	}

	const optionalPublisherTypeAttribs = {};
	let publisherType;
	if (!isNil(optionalPublisherAttribs.typeId)) {
		optionalPublisherTypeAttribs.id = optionalPublisherAttribs.typeId;
		publisherType = await new PublisherType({id: optionalPublisherAttribs.typeId})
			.fetch({require: false});
	}
	if (!publisherType) {
		publisherType = await new PublisherType({label: `Publisher Type ${optionalPublisherAttribs.typeId || random.number()}`, ...optionalPublisherTypeAttribs})
			.save(null, {method: 'insert'});
	}

	const publisherAttribs = {
		areaId: area.id,
		bbid,
		beginDay: 25,
		beginMonth: 12,
		beginYear: 2000,
		endDay: 10,
		endMonth: 5,
		endYear: 2012,
		ended: true,
		typeId: publisherType.id,
		...optionalPublisherAttribs
	};
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
		'bookbrainz.edition_format',
		'bookbrainz.author_type',
		'bookbrainz.publisher_type',
		'bookbrainz.user_collection',
		'bookbrainz.user_collection_item',
		'bookbrainz.user_collection_collaborator',
		'bookbrainz.language_set',
		'musicbrainz.area',
		'musicbrainz.language',
		'musicbrainz.gender'
	]);
}
