import * as error from '../../../../src/common/helpers/error';
import {
	createAuthor, createEdition,
	createEditionGroup,
	createEditor, createPublisher, createWork,
	truncateEntities
} from '../../../test-helpers/create-entities';
import {date, random} from 'faker';
import {
	getAssociatedEntityRevisions,
	getOrderedRevisionForEditorPage,
	getOrderedRevisions,
	getOrderedRevisionsForEntityPage
} from '../../../../src/server/helpers/revisions';
import chai from 'chai';
import orm from '../../../bookbrainz-data';


const {expect} = chai;
chai.use(require('chai-sorted'));


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
			revisionAttribs.id = random.number();
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
		const revisionId = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId})
			.save(null, {method: 'insert'});
		const dataId = random.number();
		// we can ignore other fields expect aliasSetId. We are interested in fetching alias only
		await new AuthorData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new AuthorRevision({bbid: authorJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		const formattedRevision = [
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId
			}
		];
		const revisionsWithEntities = await getAssociatedEntityRevisions(formattedRevision, orm);

		expect(revisionsWithEntities.length).to.be.equal(1);
		expect(revisionsWithEntities[0].entities.length).to.be.equal(1);
		expect(revisionsWithEntities[0].entities[0].defaultAlias.id).to.be.equal(expectedDefaultAliasId);
	});

	it('should return formatted revisions array after adding entities (1 revision with multiple (different type) entities revised)', async () => {
		// here author, work, edition, editionGroup, publisher is revised
		const revisionId = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId})
			.save(null, {method: 'insert'});

		// We are interested in fetching alias only, we can ignore other fields.
		// setting each entity's alias to author's alias
		let dataId = random.number();
		await new AuthorData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new AuthorRevision({bbid: authorJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		dataId = random.number();
		await new EditionData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new EditionRevision({bbid: editionJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		dataId = random.number();
		await new EditionGroupData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new EditionGroupRevision({bbid: editionGroupJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		dataId = random.number();
		await new PublisherData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new PublisherRevision({bbid: publisherJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		dataId = random.number();
		await new WorkData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

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

		const revisionId = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId})
			.save(null, {method: 'insert'});

		// We are interested in fetching alias only, we can ignore other fields.
		// setting each entity's alias to author's alias
		let dataId = random.number();
		await new WorkData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		dataId = random.number();
		await new WorkData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON2.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

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
		let dataId = random.number();
		const revisionId = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId})
			.save(null, {method: 'insert'});
		await new AuthorData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new AuthorRevision({bbid: authorJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});

		dataId = random.number();
		const revisionId2 = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId2})
			.save(null, {method: 'insert'});
		await new EditionData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new EditionRevision({bbid: editionJSON.bbid, dataId, id: revisionId2}).save(null, {method: 'insert'});

		dataId = random.number();
		const revisionId3 = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId3})
			.save(null, {method: 'insert'});
		await new EditionGroupData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new EditionGroupRevision({bbid: editionGroupJSON.bbid, dataId, id: revisionId3}).save(null, {method: 'insert'});

		dataId = random.number();
		const revisionId4 = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId4})
			.save(null, {method: 'insert'});
		await new PublisherData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new PublisherRevision({bbid: publisherJSON.bbid, dataId, id: revisionId4}).save(null, {method: 'insert'});

		dataId = random.number();
		const revisionId5 = random.number();
		await new Revision({authorId: editorJSON.id, id: revisionId5})
			.save(null, {method: 'insert'});
		await new WorkData({aliasSetId, id: dataId}).save(null, {method: 'insert'});
		await new WorkRevision({bbid: workJSON.bbid, dataId, id: revisionId5}).save(null, {method: 'insert'});

		const formattedRevision = [
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revisionId2
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revisionId3
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revisionId4
			},
			{
				authorId: editorJSON.id,
				entities: [],
				revisionId: revisionId5
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
			revisionAttribs.id = random.number();
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
		req.params.id = random.number();
		try {
			await getOrderedRevisionForEditorPage(0, 10, req);
		}
		catch (err) {
			const expectedError = new error.NotFoundError('Editor not found', req);
			expect(err.message).to.equal(expectedError.message);
		}
	});

	it('should return sorted revisions with notes sorted according to "postedAt"', async () => {
		const revisionID = random.number();
		const editor = await createEditor();
		const editorJSON2 = editor.toJSON();
		await new Revision({
			authorId: editorJSON2.id,
			createdAt: date.recent(),
			id: revisionID
		}).save(null, {method: 'insert'});

		const noteAttrib = {
			authorId: editorJSON2.id,
			content: 'note content',
			revisionID
		};

		// Creating 10 notes for this new revision
		const promiseArray = [];
		for (let i = 1; i <= 10; i++) {
			noteAttrib.id = random.number();
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
	// eslint-disable-next-line one-var
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
			const revisionId = random.number();
			const dataId = random.number();
			await new Revision({authorId: editorJSON.id, createdAt: date.recent(), id: revisionId}).save(null, {method: 'insert'});
			await new AuthorData({aliasSetId: authorJSON.aliasSetId, id: dataId}).save(null, {method: 'insert'});
			await new AuthorRevision({bbid: authorJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});
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
			const revisionId = random.number();
			const dataId = random.number();
			await new Revision({authorId: editorJSON.id, createdAt: date.recent(), id: revisionId}).save(null, {method: 'insert'});
			await new WorkData({aliasSetId: workJSON.aliasSetId, id: dataId}).save(null, {method: 'insert'});
			await new WorkRevision({bbid: workJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});
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
			const revisionId = random.number();
			const dataId = random.number();
			await new Revision({authorId: editorJSON.id, createdAt: date.recent(), id: revisionId}).save(null, {method: 'insert'});
			await new EditionData({aliasSetId: editionJSON.aliasSetId, id: dataId}).save(null, {method: 'insert'});
			await new EditionRevision({bbid: editionJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});
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
			const revisionId = random.number();
			const dataId = random.number();
			await new Revision({authorId: editorJSON.id, createdAt: date.recent(), id: revisionId}).save(null, {method: 'insert'});
			await new PublisherData({aliasSetId: publisherJSON.aliasSetId, id: dataId}).save(null, {method: 'insert'});
			await new PublisherRevision({bbid: publisherJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});
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
			const revisionId = random.number();
			const dataId = random.number();
			await new Revision({authorId: editorJSON.id, createdAt: date.recent(), id: revisionId}).save(null, {method: 'insert'});
			await new EditionGroupData({aliasSetId: editionGroupJSON.aliasSetId, id: dataId}).save(null, {method: 'insert'});
			await new EditionGroupRevision({bbid: editionGroupJSON.bbid, dataId, id: revisionId}).save(null, {method: 'insert'});
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
			noteAttrib.id = random.number();
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

	/* eslint-disable camelcase */
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
