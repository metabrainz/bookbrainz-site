import {createAuthor, createEditor, createWork, getRandomUUID, truncateEntities} from '../../../../test-helpers/create-entities';
import {deleteRelationships, getDefaultAliasIndex, processMergeOperation} from '../../../../../src/server/routes/entity/entity';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import orm from '../../../../bookbrainz-data';
import {random} from 'faker';


chai.use(chaiAsPromised);
const {expect} = chai;

const {Author, Work, Revision, WorkRevision, WorkHeader,
	Relationship, RelationshipSet, RelationshipType,
	bookshelf, util} = orm;

describe('getDefaultAliasIndex', () => {
	const defaultAlias = {
		default: true,
		id: 33,
		name: 'Bob'
	};
	const randomAliases = [
		{
			default: false,
			id: 1,
			name: 'Bob'
		},
		{
			default: false,
			id: 2,
			name: 'John'
		},
		{
			default: false,
			id: 100,
			name: 'Fnord'
		}
	];

	it('should return null if there is not aliasSet', () => {
		expect(getDefaultAliasIndex()).to.be.null;
		expect(getDefaultAliasIndex(null)).to.be.null;
		// eslint-disable-next-line no-undefined
		expect(getDefaultAliasIndex(undefined)).to.be.null;
	});

	it('should return null if there are no aliases in the aliasSet', () => {
		const aliasSet = {
			aliases: null
		};
		expect(getDefaultAliasIndex(aliasSet)).to.be.null;
		aliasSet.aliases = [];
		expect(getDefaultAliasIndex(aliasSet)).to.be.null;
	});

	it('should return 0 if there is no defaultAliasId and no alias marked as default', () => {
		const aliasSet = {
			aliases: randomAliases,
			defaultAliasId: null
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(0);
	});

	it('should return the index of the first alias marked as default if there is no defaultAliasId', () => {
		const aliasSet = {
			aliases: [
				randomAliases[0],
				randomAliases[1],
				defaultAlias,
				randomAliases[2],
				defaultAlias
			],
			defaultAliasId: null
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(2);
	});
	it("should return the index of the alias matching the set's defaultAliasId", () => {
		const aliasSet = {
			aliases: [...randomAliases, defaultAlias],
			defaultAliasId: 100
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(2);
	});
	it("should return the index of the alias matching the set's defaultAliasId if it is a string", () => {
		const aliasSet = {
			aliases: [...randomAliases, defaultAlias],
			defaultAliasId: '100'
		};
		expect(getDefaultAliasIndex(aliasSet)).to.equal(2);
	});
});

describe('deleteRelationships', () => {
	let author;
	let editor;
	let relationshipTypeData;

	before(async () => {
		editor = await createEditor();

		// Create RelationshipType Data
		relationshipTypeData = {
			description: 'test descryption',
			id: 1,
			label: 'test label',
			linkPhrase: 'test phrase',
			reverseLinkPhrase: 'test reverse link phrase',
			sourceEntityType: 'Author',
			targetEntityType: 'Work'
		};
		await new RelationshipType(relationshipTypeData)
			.save(null, {method: 'insert'});
	});
	beforeEach(async () => {
		author = await createAuthor();
	});
	after(truncateEntities);
	it('it should return an empty array if there are no relationships to delete', async () => {
		author = await new Author({bbid: author.get('bbid')}).fetch({withRelated: 'relationshipSet.relationships'});
		const affectedEntities = await deleteRelationships(orm, null, author.toJSON());
		expect(affectedEntities).to.have.length(0);
	});
	it('it should return an empty array if the other entity is a deleted entity (no dataId)', async () => {
		// Create Entities
		const work = await createWork();

		// Create Relation and its data between two entites
		const relationshipData = {
			id: random.number(),
			sourceBbid: author.get('bbid'),
			targetBbid: work.get('bbid'),
			typeId: 1
		};
		relationshipData.typeId = relationshipTypeData.id;
		const relationship = await new Relationship(relationshipData)
			.save(null, {method: 'insert'});

		// Create Relationship Set for Author Entity
		const authorRelationshipSetId = random.number();
		const authorRelationshipSet = await new RelationshipSet({id: authorRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationship]).then(() => model)
			);

		// Create Relationship Set for Work Entity
		const workRelationshipSetId = random.number();
		const workRelationshipSet = await new RelationshipSet({id: workRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationship]).then(() => model)
			);

		// Create a Revision for Entities
		let revisionId = random.number();
		await new Revision({authorId: editor.get('id'), id: revisionId})
			.save(null, {method: 'insert'});

		// Set the Entity Attributes as Required
		author.set('revisionId', revisionId);
		author.set('relationshipSetId', authorRelationshipSet.get('id'));
		work.set('revisionId', revisionId);
		work.set('relationshipSetId', workRelationshipSet.get('id'));

		// Save the Entities and Update the database
		await author.save(null, {method: 'update'});
		await work.save(null, {method: 'update'});

		// Create New Revision to delete Entity
		revisionId = random.number();
		await new Revision({authorId: editor.get('id'), id: revisionId})
			.save(null, {method: 'insert'});

		// Delete Work Entity
		await new WorkRevision({
			bbid: work.get('bbid'),
			dataId: null,
			id: revisionId
		}).save(null, {
			method: 'insert'
		});

		await new WorkHeader({
			bbid: work.get('bbid'),
			masterRevisionId: revisionId
		}).save(null);

		const affectedEntities = await deleteRelationships(orm, null, author.toJSON());

		expect(affectedEntities).to.have.length(0);
	});
	it('it should return an array containing the other entity to modify (this should also check that the returned entity model has a changed relationshipSetId)', async () => {
		// Create Entities
		const work = await createWork();

		// Create Relation and its data between two entites
		const relationshipData = {
			id: random.number(),
			sourceBbid: author.get('bbid'),
			targetBbid: work.get('bbid'),
			typeId: 1
		};
		relationshipData.typeId = relationshipTypeData.id;
		const relationship = await new Relationship(relationshipData)
			.save(null, {method: 'insert'});

		// Create Relationship Set for Author Entity
		const authorRelationshipSetId = random.number();
		const authorRelationshipSet = await new RelationshipSet({id: authorRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationship]).then(() => model)
			);

		// Create Relationship Set for Work Entity
		const workRelationshipSetId = random.number();
		const workRelationshipSet = await new RelationshipSet({id: workRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationship]).then(() => model)
			);

		// Create a Revision for Entities
		const revisionId = random.number();
		await new Revision({authorId: editor.get('id'), id: revisionId})
			.save(null, {method: 'insert'});

		// Set the Entity Attributes as Required
		author.set('revisionId', revisionId);
		author.set('relationshipSetId', authorRelationshipSet.get('id'));
		work.set('revisionId', revisionId);
		work.set('relationshipSetId', workRelationshipSet.get('id'));

		// Save the Entities and Update the database
		await author.save(null, {method: 'update'});
		await work.save(null, {method: 'update'});

		// Fetch Refreshed Entities from database
		author = await new Author({bbid: author.get('bbid')}).fetch({withRelated: 'relationshipSet.relationships'});

		// Get Updated Work
		const affectedEntities = await deleteRelationships(orm, null, author.toJSON());

		expect(workRelationshipSet.get('id')).to.not.equal(affectedEntities[0].get('relationshipSetId'));
		expect(affectedEntities).to.have.length(1);
	});
	it('it should delete only the relationships to the entity being deleted (meaning if entity A has rels to B and C and I deleted B, A should still have a rel to C)', async () => {
		// Create Entities
		const workABBID = getRandomUUID();
		const workBBBID = getRandomUUID();
		let workA = await createWork(workABBID);
		const workB = await createWork(workBBBID);

		// Create Revision
		const revisionId = random.number();
		await new Revision({authorId: editor.get('id'), id: revisionId})
			.save(null, {method: 'insert'});

		// Create Relations between entity
		const relationshipDataA = {
			id: 1,
			sourceBbid: author.get('bbid'),
			targetBbid: workA.get('bbid'),
			typeId: 1
		};
		const relationshipDataB = {
			id: 1,
			sourceBbid: author.get('bbid'),
			targetBbid: workB.get('bbid'),
			typeId: 1
		};

		// Relate Relationship Data with Relationship Type
		relationshipDataA.typeId = relationshipTypeData.id;
		relationshipDataA.id = random.number();

		relationshipDataB.typeId = relationshipTypeData.id;
		relationshipDataB.id = random.number();

		// Create Relationships for Entities
		const relationshipA = await new Relationship(relationshipDataA)
			.save(null, {method: 'insert'});

		const relationshipB = await new Relationship(relationshipDataB)
			.save(null, {method: 'insert'});

		// Create Relationship set ids for entities
		const authorRelationshipSetId = random.number();
		const workARelationshipSetId = random.number();
		const workBRelationshipSetId = random.number();

		// Create Relationship sets
		const authorRelationshipSet = await new RelationshipSet({id: authorRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipA, relationshipB]).then(() => model)
			);

		const workARelationshipSet = await new RelationshipSet({id: workARelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipA]).then(() => model)
			);

		const workBRelationshipSet = await new RelationshipSet({id: workBRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipB]).then(() => model)
			);

		// Set the Entity Attributes as Required
		author.set('revisionId', revisionId);
		author.set('relationshipSetId', authorRelationshipSet.get('id'));
		workA.set('revisionId', revisionId);
		workA.set('relationshipSetId', workARelationshipSet.get('id'));
		workB.set('revisionId', revisionId);
		workB.set('relationshipSetId', workBRelationshipSet.get('id'));

		// Save the Entities and Update the database
		await author.save(null, {method: 'update'});
		await workA.save(null, {method: 'update'});
		await workB.save(null, {method: 'update'});

		// Get updated Entity
		workA = await new Work({bbid: workA.get('bbid')}).fetch({withRelated: 'relationshipSet.relationships'});

		// Get list of Affected Entities
		const affectedEntities = await deleteRelationships(orm, null, workA.toJSON());

		const affectedEntityRelationshipSet = await new RelationshipSet({
			id: affectedEntities[0].get('relationshipSetId')
		}).fetch({withRelated: 'relationships'});

		expect(affectedEntities[0].get('bbid')).to.equal(author.get('bbid'));
		expect(affectedEntityRelationshipSet.get('id')).to.not.equal(authorRelationshipSetId);
		expect(affectedEntityRelationshipSet.related('relationships').toJSON()[0].targetBbid).to.be.equal(workB.get('bbid'));
		expect(affectedEntities).to.have.length(1);
	});
	it('it should return an array with multiple other entities to modify if there are relationships to multiple entities', async () => {
		// Create Entites
		const workABBID = getRandomUUID();
		const workBBBID = getRandomUUID();
		const workCBBID = getRandomUUID();
		const workA = await createWork(workABBID);
		const workB = await createWork(workBBBID);
		const workC = await createWork(workCBBID);

		// Create Revision
		const revisionId = random.number();
		await new Revision({authorId: editor.get('id'), id: revisionId})
			.save(null, {method: 'insert'});

		// Create Relations between entity
		const relationshipDataA = {
			id: 1,
			sourceBbid: author.get('bbid'),
			targetBbid: workA.get('bbid'),
			typeId: 1
		};
		const relationshipDataB = {
			id: 1,
			sourceBbid: author.get('bbid'),
			targetBbid: workB.get('bbid'),
			typeId: 1
		};
		const relationshipDataC = {
			id: 1,
			sourceBbid: author.get('bbid'),
			targetBbid: workC.get('bbid'),
			typeId: 1
		};

		// Relate Relationship Data with Relationship Type
		relationshipDataA.typeId = relationshipTypeData.id;
		relationshipDataA.id = random.number();

		relationshipDataB.typeId = relationshipTypeData.id;
		relationshipDataB.id = random.number();

		relationshipDataC.typeId = relationshipTypeData.id;
		relationshipDataC.id = random.number();

		// Create Relationships for Entities
		const relationshipA = await new Relationship(relationshipDataA)
			.save(null, {method: 'insert'});

		const relationshipB = await new Relationship(relationshipDataB)
			.save(null, {method: 'insert'});

		const relationshipC = await new Relationship(relationshipDataC)
			.save(null, {method: 'insert'});

		// Create Relationship set ids for entities
		const authorRelationshipSetId = random.number();
		const workARelationshipSetId = random.number();
		const workBRelationshipSetId = random.number();
		const workCRelationshipSetId = random.number();

		// Create Relationship sets
		const authorRelationshipSet = await new RelationshipSet({id: authorRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipA, relationshipB, relationshipC]).then(() => model)
			);

		const workARelationshipSet = await new RelationshipSet({id: workARelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipA]).then(() => model)
			);

		const workBRelationshipSet = await new RelationshipSet({id: workBRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipB]).then(() => model)
			);

		const workCRelationshipSet = await new RelationshipSet({id: workCRelationshipSetId})
			.save(null, {method: 'insert'})
			.then(
				(model) =>
					model.relationships().attach([relationshipC]).then(() => model)
			);

		// Set the Entity Attributes as Required
		author.set('revisionId', revisionId);
		author.set('relationshipSetId', authorRelationshipSet.get('id'));
		workA.set('revisionId', revisionId);
		workA.set('relationshipSetId', workARelationshipSet.get('id'));
		workB.set('revisionId', revisionId);
		workB.set('relationshipSetId', workBRelationshipSet.get('id'));
		workC.set('revisionId', revisionId);
		workC.set('relationshipSetId', workCRelationshipSet.get('id'));

		// Save the Entities and Update the database
		await author.save(null, {method: 'update'});
		await workA.save(null, {method: 'update'});
		await workB.save(null, {method: 'update'});
		await workC.save(null, {method: 'update'});

		// Get updated Entity
		author = await new Author({bbid: author.get('bbid')}).fetch({withRelated: 'relationshipSet.relationships'});

		// Get list of Affected Entities
		const affectedEntities = await deleteRelationships(orm, null, author.toJSON());

		expect(affectedEntities).to.have.length(3);
	});
});
describe('processMergeOperation', () => {
	let author1BBID;
	let author2BBID;
	let author1;
	let author2;

	before(async () => {
		author1BBID = getRandomUUID();
		author2BBID = getRandomUUID();
		author1 = await createAuthor(author1BBID);
		author2 = await createAuthor(author2BBID);
	});
	after(truncateEntities);
	afterEach(async () => {
		await util.truncateTables(bookshelf, ['bookbrainz.entity_redirect']);
	});

	it('should throw an error if there is no mergingEntities in the mergeQueue', () => {
		const mergeQueue = {mergingEntities: null};
		expect(
			processMergeOperation(orm, null, {mergeQueue}, author1, [author1], {})
		).to.be.rejectedWith('Merge handler called with no merge queue, aborting');
	});
	it('should throw an error if trying to merge into an entity not in the mergeQueue', () => {
		const anotherBBIB = getRandomUUID();
		const mergeQueue = {
			mergingEntities: {
				[anotherBBIB]: {},
				[author2BBID]: author2.toJSON()
			}
		};
		expect(
			processMergeOperation(orm, null, {mergeQueue}, author1, [author1], {})
		).to.be.rejectedWith('Entity being merged into does not appear in merge queue, aborting');
	});
	it('should add the entity to be merged to the returned entities', async () => {
		const author1Fetched = await Author.forge({bbid: author1BBID}).fetch();
		const mergeQueue = {
			entityType: 'Author',
			mergingEntities: {
				[author1BBID]: author1Fetched.toJSON(),
				[author2BBID]: author2.toJSON()
			}
		};
		const trx = await bookshelf.knex.transaction();
		const returnedEntities = await processMergeOperation(orm, trx, {mergeQueue}, author1Fetched, [author1Fetched], {});
		await trx.commit();
		const returnedEntitiesBBIDs = returnedEntities.map(entity => entity.get('bbid'));
		expect(returnedEntitiesBBIDs).to.include.members([author1BBID, author2BBID]);
	});
	it('should add the bbid of the merged entity to the entity_redirect table', async () => {
		const author1Fetched = await Author.forge({bbid: author1BBID}).fetch();
		const mergeQueue = {
			entityType: 'Author',
			mergingEntities: {
				[author1BBID]: author1Fetched.toJSON(),
				[author2BBID]: author2.toJSON()
			}
		};
		const trx = await bookshelf.knex.transaction();
		const returnedEntities = await processMergeOperation(orm, trx, {mergeQueue}, author1Fetched, [author1Fetched], {});
		await trx.commit();
		const redirects = await bookshelf.knex('bookbrainz.entity_redirect').select('source_bbid');
		expect(redirects[0].source_bbid).to.equal(author2BBID);
	});
	it('should modify the relationshipSet of any entity related to an entity being merged', async () => {
		const author1Fetched = await Author.forge({bbid: author1BBID}).fetch();
		const mergeQueue = {
			entityType: 'Author',
			mergingEntities: {
				[author1BBID]: author1Fetched.toJSON(),
				[author2BBID]: author2.toJSON()
			}
		};
		const author2Relationships = await new RelationshipSet({
			id: author2.get('relationshipSetId')
		}).fetch({withRelated: 'relationships'});
		const relatedEntityBBID = author2Relationships.related('relationships').toJSON()[0].targetBbid;

		const trx = await bookshelf.knex.transaction();
		const modifiedRelationshipSets = {};
		const returnedEntities = await processMergeOperation(orm, trx, {mergeQueue}, author1Fetched, [author1Fetched], modifiedRelationshipSets);
		await trx.commit();
		const relatedEntityNotMerged = returnedEntities.find(entity => entity.get('bbid') === relatedEntityBBID);
		expect(relatedEntityNotMerged).to.exist;
		expect(modifiedRelationshipSets).to.haveOwnProperty(relatedEntityBBID);
		// Removing the only relationship of an entity should set the relationshipSetId to 'null'
		expect(modifiedRelationshipSets[relatedEntityBBID]).to.be.null;
	});
});
