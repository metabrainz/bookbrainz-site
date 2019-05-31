/* eslint-disable */

import app from '../../../../src/api/app';
import orm from '../../../bookbrainz-data';
/// Import the dependencies for testing
import chai from 'chai';
import chaiHttp from 'chai-http';
import faker from 'faker';
// Configure chai
chai.use(chaiHttp);
chai.should();

const {
	Alias, AliasSet, Annotation, Disambiguation, Editor, EditorType, Entity, Gender,
	IdentifierSet, RelationshipSet, Revision, Work, bookshelf, util
} = orm;

const genderData = {
	id: 1,
	name: 'test'
};
const editorTypeData = {
	id: 1,
	label: 'test_type'
};
const editorData = {
	genderId: 1,
	id: 1,
	name: 'bob',
	typeId: 1
};
const setData = {id: 1};

const aliasData = {
	id: 1,
	name: 'work name',
	sortName: 'Work sort name'
};

const revisionAttribs = {
	authorId: 1,
	id: 1
};
const aBBID = faker.random.uuid();
const workAttribs = {
	aliasSetId: 1,
	annotationId: 1,
	bbid: aBBID,
	disambiguationId: 1,
	identifierSetId: 1,
	relationshipSetId: 1,
	revisionId: 1
};



describe("GET /work", () => {
	before(
		async () =>{
			await new Gender(genderData)
				.save(null, {method: 'insert'});
			await new EditorType(editorTypeData)
				.save(null, {method: 'insert'})
			await new Editor(editorData)
				.save(null, {method: 'insert'})
			await new Alias(aliasData)
				.save(null, {method: 'insert'})
			await new AliasSet({...setData, defaultAliasId: 1})
					.save(null, {method: 'insert'});
			await new IdentifierSet(setData)
					.save(null, {method: 'insert'});
			await new RelationshipSet(setData)
					.save(null, {method: 'insert'});
			await new Disambiguation({
					comment: 'Test Disambiguation',
					id: 1
				})
				.save(null, {method: 'insert'});
			await new Entity({bbid: aBBID, type: 'Work'})
					.save(null, {method: 'insert'});
			await new Revision(revisionAttribs)
				.save(null, {method: 'insert'});
			await new Annotation({
					content: 'Test Annotation',
					id: 1,
					lastRevisionId: 1})
				.save(null, {method: 'insert'});
			await new Work(workAttribs)
				.save(null, {method: 'insert'});
		});

	after(function truncate() {
		this.timeout(0); // eslint-disable-line babel/no-invalid-this

		return util.truncateTables(bookshelf, [
			'bookbrainz.entity',
			'bookbrainz.revision',
			'bookbrainz.relationship_set',
			'bookbrainz.identifier_set',
			'bookbrainz.alias',
			'bookbrainz.alias_set',
			'bookbrainz.annotation',
			'bookbrainz.disambiguation',
			'bookbrainz.editor',
			'bookbrainz.editor_type',
			'bookbrainz.work_header',
			'musicbrainz.gender'
		]);
	});

	// Test to get basic information of a work
	it("should get basic information of work", (done) => {
		 chai.request(app)
			 .get(`/work/${aBBID}`)
			 .end((err, res) => {
				 res.should.have.status(200);
				 res.body.should.be.a('object');
				 res.body.should.all.keys(
					'bbid',
					'defaultAlias',
					'languages',
					'disambiguation',
					'entityType'
				);
				 done();
			  });
	 });

});
