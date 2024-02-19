/* eslint-disable camelcase */

import * as error from '../../../../src/common/helpers/error';

import {
	createAuthor,
	createEdition,
	createEditionGroup,
	createEditor,
	createPublisher,
	createWork,
	truncateEntities
} from '../../../test-helpers/create-entities';
import {
	getAssociatedEntityRevisions,
	getOrderedRevisionForEditorPage,
	getOrderedRevisions,
	getOrderedRevisionsForEntityPage
} from '../../../../src/server/helpers/revisions';

import chai from 'chai';
import {faker} from '@faker-js/faker';
import isSorted from 'chai-sorted';
import orm from '../../../bookbrainz-data';


const {date} = faker;

const {expect} = chai;
chai.use(isSorted);

const {
	AuthorData, AuthorRevision, Revision, AliasSet,
	EditionData, EditionRevision, EditionGroupData, EditionGroupRevision,
	Note, PublisherData, PublisherRevision, WorkData, WorkRevision
} = orm;


describe('getOrderedRevisions', () => {
	before(async () => {
		const editor = await createEditor();
		const editorJSON = editor.toJSON();
		const revisionAttribs = {
			authorId: editorJSON.id
		};
		const promiseArray = [];
		for (let id = 1; id <= 50; id++) {
			revisionAttribs.createdAt = date.recent();
			promiseArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(promiseArray);
	});
	after(truncateEntities);

	it('should return sorted revisions with the expected keys', async () => {
		const from = 0;
		const size = 50;
		const orderedRevisions = await getOrderedRevisions(from, size, orm);
		orderedRevisions.forEach(revision => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'entities',
				'revisionId',
				'isMerge'
			);
		});
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return the expected subset of revisions when passed an offset (from)', async () => {
		const from = 40;
		const size = 10;
		const allRevisions = await getOrderedRevisions(0, 50, orm);
		const orderedRevisions = await getOrderedRevisions(from, size, orm);
		const allRevisionsSubset = allRevisions.slice(from, from + size);
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.deep.equal(allRevisionsSubset);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return no results if offset is higher than total revisions', async () => {
		// 50 revisions were created
		const orderedRevisions = await getOrderedRevisions(51, 10, orm);
		expect(orderedRevisions.length).to.be.equal(0);
	});
});

describe('getAssociatedEntityRevisions', () => {
	// eslint-disable-next-line one-var
	let aliasSetId, authorJSON, editionGroupJSON, editionJSON,
		editorJSON, expectedDefaultAliasId, publisherJSON, workJSON;
	beforeEach(async () => {
		const author = await createAuthor();
		const edition = await createEdition();
		const editionGroup = await createEditionGroup();
		const publisher = await createPublisher();
		const work = await createWork();
		const editor = await createEditor();
		authorJSON = author.toJSON();
		editionJSON = edition.toJSON();
		editorJSON = editor.toJSON();
		editionGroupJSON = editionGroup.toJSON();
		publisherJSON = publisher.toJSON();
		workJSON = work.toJSON();

		// In each revision, we will change the alias of entity to AuthorJSON alias.
		// We need expectedDefaultAliasId to check the test
		const aliasSet = await new AliasSet().where({id: authorJSON.aliasSetId}).fetch();
		const aliasSetJSON = aliasSet.toJSON();
		aliasSetId = aliasSetJSON.id;
		expectedDefaultAliasId = aliasSetJSON.defaultAliasId;
	});
	afterEach(truncateEntities);

	it('should return formatted revisions array after adding entity (1 revision with 1 entity revised)', async () => {
		// here author is revised
		const revision = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		// we can ignore other fields expect aliasSetId. We are interested in fetching alias only
		const authorData = await new AuthorData({aliasSetId}).save(null, {method: 'insert'});
		await new AuthorRevision({bbid: authorJSON.bbid, dataId: authorData.id, id: revision.id}).save(null, {method: 'insert'});

		const formattedRevision = [
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revision.id
			}
		];
		const revisionsWithEntities = await getAssociatedEntityRevisions(formattedRevision, orm);

		expect(revisionsWithEntities.length).to.be.equal(1);
		expect(revisionsWithEntities[0].entities.length).to.be.equal(1);
		expect(revisionsWithEntities[0].entities[0].defaultAlias.id).to.be.equal(expectedDefaultAliasId);
	});

	it('should return formatted revisions array after adding entities (1 revision with multiple (different type) entities revised)', async () => {
		// here author, work, edition, editionGroup, publisher is revised
		const revision = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		const revisionId = revision.id;

		// We are interested in fetching alias only, we can ignore other fields.
		// setting each entity's alias to author's alias
		const authorData = await new AuthorData({aliasSetId}).save(null, {method: 'insert'});
		await new AuthorRevision({bbid: authorJSON.bbid, dataId: authorData.id, id: revisionId}).save(null, {method: 'insert'});

		const editionData = await new EditionData({aliasSetId}).save(null, {method: 'insert'});
		await new EditionRevision({bbid: editionJSON.bbid, dataId: editionData.id, id: revisionId}).save(null, {method: 'insert'});

		const editionGroupData = await new EditionGroupData({aliasSetId}).save(null, {method: 'insert'});
		await new EditionGroupRevision({bbid: editionGroupJSON.bbid, dataId: editionGroupData.id, id: revisionId}).save(null, {method: 'insert'});

		const publisherData = await new PublisherData({aliasSetId}).save(null, {method: 'insert'});
		await new PublisherRevision({bbid: publisherJSON.bbid, dataId: publisherData.id, id: revisionId}).save(null, {method: 'insert'});

		const workData = await new WorkData({aliasSetId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON.bbid, dataId: workData.id, id: revisionId}).save(null, {method: 'insert'});

		const formattedRevision = [
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId
			}
		];
		const revisionsWithEntities = await getAssociatedEntityRevisions(formattedRevision, orm);

		expect(revisionsWithEntities.length).to.be.equal(1);
		expect(revisionsWithEntities[0].entities.length).to.be.equal(5);
		revisionsWithEntities[0].entities.forEach((entity) => {
			expect(entity.defaultAlias.id).to.be.equal(expectedDefaultAliasId);
		});
	});

	it('should return formatted revisions array after adding entities ' +
		'(1 revision with multiple entities ( same type ) revised)', async () => {
		// here work and work2 are revised.
		const work2 = await createWork();
		const workJSON2 = work2.toJSON();

		const revision = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		const revisionId = revision.id;

		// We are interested in fetching alias only, we can ignore other fields.
		// setting each entity's alias to author's alias
		const workData = await new WorkData({aliasSetId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON.bbid, dataId: workData.id, id: revisionId}).save(null, {method: 'insert'});

		const workData2 = await new WorkData({aliasSetId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON2.bbid, dataId: workData2.id, id: revisionId}).save(null, {method: 'insert'});

		const formattedRevision = [
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId
			}
		];
		const revisionsWithEntities = await getAssociatedEntityRevisions(formattedRevision, orm);

		expect(revisionsWithEntities.length).to.be.equal(1);
		expect(revisionsWithEntities[0].entities.length).to.be.equal(2);
		revisionsWithEntities[0].entities.forEach((entity) => {
			expect(entity.defaultAlias.id).to.be.equal(expectedDefaultAliasId);
		});
	});

	it('should return formatted revisions array after adding entities (5 revision each with single entity revised)', async () => {
		// here author, work, edition, editionGroup, publisher is revised

		// We are interested in fetching alias only, we can ignore other fields.
		// setting each entity's alias to author's alias
		const revision1 = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		let data = await new AuthorData({aliasSetId}).save(null, {method: 'insert'});
		await new AuthorRevision({bbid: authorJSON.bbid, dataId: data.id, id: revision1.id}).save(null, {method: 'insert'});

		const revision2 = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		data = await new EditionData({aliasSetId}).save(null, {method: 'insert'});
		await new EditionRevision({bbid: editionJSON.bbid, dataId: data.id, id: revision2.id}).save(null, {method: 'insert'});


		const revision3 = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		data = await new EditionGroupData({aliasSetId}).save(null, {method: 'insert'});
		await new EditionGroupRevision({bbid: editionGroupJSON.bbid, dataId: data.id, id: revision3.id}).save(null, {method: 'insert'});

		const revision4 = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		data = await new PublisherData({aliasSetId}).save(null, {method: 'insert'});
		await new PublisherRevision({bbid: publisherJSON.bbid, dataId: data.id, id: revision4.id}).save(null, {method: 'insert'});

		const revision5 = await new Revision({authorId: editorJSON.id})
			.save(null, {method: 'insert'});
		data = await new WorkData({aliasSetId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON.bbid, dataId: data.id, id: revision5.id}).save(null, {method: 'insert'});

		const formattedRevision = [
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revision1.id
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revision2.id
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revision3.id
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revision4.id
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revision5.id
			}
		];
		const revisionsWithEntities = await getAssociatedEntityRevisions(formattedRevision, orm);

		expect(revisionsWithEntities.length).to.be.equal(5);
		revisionsWithEntities.forEach((revision) => {
			expect(revision.entities.length).to.be.equal(1);
			revision.entities.forEach((entity) => {
				expect(entity.defaultAlias.id).to.be.equal(expectedDefaultAliasId);
			});
		});
	});
});

describe('getOrderedRevisionForEditorPage', () => {
	// eslint-disable-next-line one-var
	let editorJSON, req;
	before(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
		const revisionAttribs = {
			authorId: editorJSON.id
		};
		const promiseArray = [];
		for (let i = 1; i <= 50; i++) {
			revisionAttribs.createdAt = date.recent();
			promiseArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(promiseArray);
		req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editorJSON.id
			}
		};
	});
	after(truncateEntities);

	it('should return sorted revisions with the expected keys', async () => {
		const from = 0;
		const size = 50;
		const orderedRevisions = await getOrderedRevisionForEditorPage(from, size, req);
		orderedRevisions.forEach(revision => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'entities',
				'notes',
				'revisionId',
				'isMerge'
			);
		});
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return the expected subset of revisions when passed an offset (from)', async () => {
		const from = 40;
		const size = 10;
		const allRevisions = await getOrderedRevisionForEditorPage(0, 50, req);
		const orderedRevisions = await getOrderedRevisionForEditorPage(from, size, req);
		const allRevisionsSubset = allRevisions.slice(from, from + size);
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.deep.equal(allRevisionsSubset);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return no results if offset is higher than total revisions', async () => {
		// only 50 revisions were created
		const orderedRevisions = await getOrderedRevisionForEditorPage(60, 10, req);
		expect(orderedRevisions.length).to.be.equal(0);
	});

	it('should throw an error for an invalid editor', async () => {
		req.params.id = '98765';
		try {
			await getOrderedRevisionForEditorPage(0, 10, req);
		}
		catch (err) {
			const expectedError = new error.NotFoundError('Editor not found', req);
			expect(err.message).to.equal(expectedError.message);
		}
	});

	it('should return sorted revisions with notes sorted according to "postedAt"', async () => {
		const editor = await createEditor();
		const editorJSON2 = editor.toJSON();
		const revision = await new Revision({
			authorId: editorJSON2.id,
			createdAt: date.recent()
		}).save(null, {method: 'insert'});

		const noteAttrib = {
			authorId: editorJSON2.id,
			content: 'note content',
			revisionId: revision.id
		};

		// Creating 10 notes for this new revision
		const promiseArray = [];
		for (let i = 1; i <= 10; i++) {
			noteAttrib.postedAt = date.recent();
			promiseArray.push(
				new Note(noteAttrib).save(null, {method: 'insert'})
			);
		}
		await Promise.all(promiseArray);

		req.params.id = editorJSON2.id;

		const orderedRevisions = await getOrderedRevisionForEditorPage(0, 10, req);
		expect(orderedRevisions.length).to.equal(1);
		expect(orderedRevisions[0]).to.have.keys(
			'createdAt',
			'editor',
			'entities',
			'notes',
			'revisionId',
			'isMerge'
		);
		expect(orderedRevisions[0].notes.length).to.be.equal(10);
		expect(orderedRevisions[0].notes).to.be.sortedBy('postedAt');
	});
});

/* eslint-disable no-await-in-loop */
describe('getOrderedRevisionsForEntityPage', () => {
	let editorJSON;
	before(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
	});
	after(truncateEntities);

	it('should return ordered revisions with expected keys (Author Revision)', async () => {
		const numberOfRevisions = 10;
		const author = await createAuthor();
		const authorJSON = author.toJSON();

		// starting from 2 because one revision is created while creating the author
		for (let i = 2; i <= numberOfRevisions; i++) {
			const revision = await new Revision({authorId: editorJSON.id, createdAt: date.recent()}).save(null, {method: 'insert'});
			const authorData = await new AuthorData({aliasSetId: authorJSON.aliasSetId}).save(null, {method: 'insert'});
			await new AuthorRevision({bbid: authorJSON.bbid, dataId: authorData.id, id: revision.id}).save(null, {method: 'insert'});
		}
		const orderedRevisions = await getOrderedRevisionsForEntityPage(orm, 0, numberOfRevisions, AuthorRevision, authorJSON.bbid);

		expect(orderedRevisions.length).to.equal(numberOfRevisions);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
		orderedRevisions.forEach((revision) => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'notes',
				'revisionId',
				'isMerge'
			);
		});
	});

	it('should return ordered revisions with expected keys (work revision)', async () => {
		const numberOfRevisions = 10;
		const work = await createWork();
		const workJSON = work.toJSON();

		// starting from 2 because one revision is created while creating the work
		for (let i = 2; i <= numberOfRevisions; i++) {
			const revision = await new Revision({authorId: editorJSON.id, createdAt: date.recent()}).save(null, {method: 'insert'});
			const data = await new WorkData({aliasSetId: workJSON.aliasSetId}).save(null, {method: 'insert'});
			await new WorkRevision({bbid: workJSON.bbid, dataId: data.id, id: revision.id}).save(null, {method: 'insert'});
		}

		const orderedRevisions = await getOrderedRevisionsForEntityPage(orm, 0, numberOfRevisions, WorkRevision, workJSON.bbid);

		expect(orderedRevisions.length).to.equal(numberOfRevisions);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
		orderedRevisions.forEach((revision) => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'notes',
				'revisionId',
				'isMerge'
			);
		});
	});

	it('should return ordered revisions with expected keys (edition revision)', async () => {
		const numberOfRevisions = 10;
		const edition = await createEdition();
		const editionJSON = edition.toJSON();

		// starting from 2 because one revision is created while creating the work
		for (let i = 2; i <= numberOfRevisions; i++) {
			const revision = await new Revision({authorId: editorJSON.id, createdAt: date.recent()}).save(null, {method: 'insert'});
			const data = await new EditionData({aliasSetId: editionJSON.aliasSetId}).save(null, {method: 'insert'});
			await new EditionRevision({bbid: editionJSON.bbid, dataId: data.id, id: revision.id}).save(null, {method: 'insert'});
		}

		const orderedRevisions = await getOrderedRevisionsForEntityPage(orm, 0, numberOfRevisions, EditionRevision, editionJSON.bbid);

		expect(orderedRevisions.length).to.equal(numberOfRevisions);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
		orderedRevisions.forEach((revision) => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'notes',
				'revisionId',
				'isMerge'
			);
		});
	});

	it('should return ordered revisions with expected keys (publisher revision)', async () => {
		const numberOfRevisions = 10;
		const publisher = await createPublisher();
		const publisherJSON = publisher.toJSON();

		// starting from 2 because one revision is created while creating the publisher
		for (let i = 2; i <= numberOfRevisions; i++) {
			const revision = await new Revision({authorId: editorJSON.id, createdAt: date.recent()}).save(null, {method: 'insert'});
			const data = await new PublisherData({aliasSetId: publisherJSON.aliasSetId}).save(null, {method: 'insert'});
			await new PublisherRevision({bbid: publisherJSON.bbid, dataId: data.id, id: revision.id}).save(null, {method: 'insert'});
		}

		const orderedRevisions = await getOrderedRevisionsForEntityPage(orm, 0, numberOfRevisions, PublisherRevision, publisherJSON.bbid);

		expect(orderedRevisions.length).to.equal(numberOfRevisions);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
		orderedRevisions.forEach((revision) => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'notes',
				'revisionId',
				'isMerge'
			);
		});
	});

	it('should return ordered revisions with expected keys (EditionGroup revision)', async () => {
		const numberOfRevisions = 10;
		const editionGroup = await createEditionGroup();
		const editionGroupJSON = editionGroup.toJSON();

		// starting from 2 because one revision is created while creating the editionGroup
		for (let i = 2; i <= numberOfRevisions; i++) {
			const revision = await new Revision({authorId: editorJSON.id, createdAt: date.recent()}).save(null, {method: 'insert'});
			const data = await new EditionGroupData({aliasSetId: editionGroupJSON.aliasSetId}).save(null, {method: 'insert'});
			await new EditionGroupRevision({bbid: editionGroupJSON.bbid, dataId: data.id, id: revision.id}).save(null, {method: 'insert'});
		}

		const orderedRevisions = await getOrderedRevisionsForEntityPage(orm, 0, numberOfRevisions, EditionGroupRevision, editionGroupJSON.bbid);

		expect(orderedRevisions.length).to.equal(numberOfRevisions);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
		orderedRevisions.forEach((revision) => {
			expect(revision).to.have.keys(
				'createdAt',
				'editor',
				'notes',
				'revisionId',
				'isMerge'
			);
		});
	});

	it('should return revisions with notes sorted according to "postedAt" and with expected keys', async () => {
		const author = await createAuthor();
		const authorJSON = await author.toJSON();
		// revision created while create author
		const revisionID = authorJSON.revisionId;

		const noteAttrib = {
			authorId: editorJSON.id,
			content: 'note content',
			revisionID
		};

		// create 10 notes for the revision
		const promiseArray = [];
		for (let i = 1; i <= 10; i++) {
			noteAttrib.postedAt = date.recent();
			promiseArray.push(
				new Note(noteAttrib).save(null, {method: 'insert'})
			);
		}
		await Promise.all(promiseArray);

		const orderedRevision = await getOrderedRevisionsForEntityPage(orm, 0, 10, AuthorRevision, authorJSON.bbid);

		expect(orderedRevision.length).to.be.equal(1);
		expect(orderedRevision[0].notes.length).to.be.equal(10);
		expect(orderedRevision[0].notes).to.be.sortedBy('postedAt');
		orderedRevision[0].notes.forEach((note) => {
			expect(note.author).to.deep.equal(editorJSON);
		});
	});

	it('should return revisions of merged entities', async () => {
		const author1 = await createAuthor();
		const author2 = await createAuthor();
		const author1JSON = await author1.toJSON();
		const author2JSON = await author2.toJSON();
		// revision created while create author
		const revisionID1 = author1JSON.revisionId;
		const revisionID2 = author2JSON.revisionId;

		// Let's pretend author2 was merged into author1
		await orm.bookshelf.knex('bookbrainz.entity_redirect')
			.insert({source_bbid: author2JSON.bbid, target_bbid: author1JSON.bbid});

		const orderedRevision = await getOrderedRevisionsForEntityPage(orm, 0, 10, AuthorRevision, author1JSON.bbid);

		expect(orderedRevision.length).to.be.equal(2);
		expect(orderedRevision[0].revisionId).to.be.equal(revisionID2);
		expect(orderedRevision[1].revisionId).to.be.equal(revisionID1);
	});

	it('should return revisions of previously merged entities recursively', async () => {
		const author1 = await createAuthor();
		const author2 = await createAuthor();
		const author3 = await createAuthor();
		const author1JSON = await author1.toJSON();
		const author2JSON = await author2.toJSON();
		const author3JSON = await author3.toJSON();
		// revision created while create author
		const revisionID1 = author1JSON.revisionId;
		const revisionID2 = author2JSON.revisionId;
		const revisionID3 = author3JSON.revisionId;

		// Let's pretend author3 was merged into author2 and author2 was merged into author1
		await orm.bookshelf.knex('bookbrainz.entity_redirect')
			.insert([
				{source_bbid: author3JSON.bbid, target_bbid: author2JSON.bbid},
				{source_bbid: author2JSON.bbid, target_bbid: author1JSON.bbid}
			]);

		const orderedRevision = await getOrderedRevisionsForEntityPage(orm, 0, 10, AuthorRevision, author1JSON.bbid);

		expect(orderedRevision.length).to.be.equal(3);
		expect(orderedRevision[0].revisionId).to.be.equal(revisionID3);
		expect(orderedRevision[1].revisionId).to.be.equal(revisionID2);
		expect(orderedRevision[2].revisionId).to.be.equal(revisionID1);
	});
});
