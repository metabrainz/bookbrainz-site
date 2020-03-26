import {
	createAuthor, createEdition,
	createEditionGroup,
	createEditor, createPublisher, createWork,
	truncateEntities
} from '../../../test-helpers/create-entities';
import {getAssociatedEntityRevisions, getOrderedRevisions} from '../../../../src/server/helpers/revisions';
import chai from 'chai';
import orm from '../../../bookbrainz-data';
import {random} from 'faker';


const {expect} = chai;
chai.use(require('chai-sorted'));


const {
	AuthorData, AuthorRevision, Revision, AliasSet,
	EditionData, EditionRevision, EditionGroupData, EditionGroupRevision,
	PublisherData, PublisherRevision, WorkData, WorkRevision
} = orm;


describe('getOrderedRevisions', () => {
	before(async () => {
		const editor = await createEditor();
		const editorJSON = editor.toJSON();
		const revisionAttribs = {
			authorId: editorJSON.id,
			id: 1
		};
		const promiseArray = [];
		for (let id = 1; id <= 1000; id++) {
			revisionAttribs.id = id;
			promiseArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(promiseArray);
	});
	after(truncateEntities);

	it('should return sorted revisions with the expected keys', async () => {
		const from = 0;
		const size = 1000;
		const orderedRevisions = await getOrderedRevisions(from, size, orm);
		orderedRevisions.forEach(revision => {
			expect(revision).to.have.keys(
				'authorId',
				'createdAt',
				'editor',
				'entities',
				'revisionId'
			);
		});
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return the expected subset of revisions when passed an offset (from)', async () => {
		const from = 900;
		const size = 10;
		const allRevisions = await getOrderedRevisions(0, 1000, orm);
		const orderedRevisions = await getOrderedRevisions(from, size, orm);
		const allRevisionsSubset = allRevisions.slice(from, from + size);
		expect(orderedRevisions.length).to.equal(size);
		expect(orderedRevisions).to.deep.equal(allRevisionsSubset);
		expect(orderedRevisions).to.be.descendingBy('createdAt');
	});

	it('should return no results if offset is higher than total revisions', async () => {
		// only 1000 revisions were created
		const orderedRevisions = await getOrderedRevisions(1001, 10, orm);
		expect(orderedRevisions.length).to.be.equal(0);
	});
});

describe('getAssociatedEntityRevisions', () => {
	// eslint-disable-next-line one-var
	let aliasSetId, authorJSON, editionGroupJSON, editionJSON,
		editorJSON, expectedDefaultAliasId, publisherJSON, workJSON;
	before(async () => {
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
	after(truncateEntities);

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
		revisionsWithEntities[0].entities.forEach((entity) => {
			expect(entity.defaultAlias.id).to.be.equal(expectedDefaultAliasId);
		});
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
