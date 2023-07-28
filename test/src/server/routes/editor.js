/* eslint-disable sort-keys */

import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {getEditorActivity} from '../../../../src/server/routes/editor';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
const {expect} = chai;
const {Editor} = orm;

const adminId = 123456;
const targetUserId = 1;
const oldPrivs = 1;
const newPrivs = 3;


describe('getEditorActivity', () => {
	const {Revision} = orm;
	let editorJSON;
	beforeEach(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
	});
	afterEach(truncateEntities);

	it('should not throw error when editor has zero revisions', async () => {
		const startDate = new Date();
		startDate.setFullYear(2020, 0, 1);
		const endDate = new Date();
		endDate.setFullYear(2020, 3, 1);
		const activity = await getEditorActivity(editorJSON.id, startDate, Revision, endDate);

		const expectedResult = {
			'Jan-20': 0, 'Feb-20': 0, 'Mar-20': 0, 'Apr-20': 0
		};
		expect(activity).to.deep.equal(expectedResult);
	});

	it('should return revision data for graph', async () => {
		const revisionAttribs = {
			authorId: editorJSON.id
		};
		const revisionsPromiseArray = [];
		for (let i = 0; i < 12; i++) {
			const tempDate = new Date();
			tempDate.setFullYear(2020, i, 1);
			revisionAttribs.createdAt = tempDate;
			revisionsPromiseArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(revisionsPromiseArray);

		const startDate = new Date();
		startDate.setFullYear(2020, 0, 1);
		const endDate = new Date();
		endDate.setFullYear(2020, 5, 1);
		const activity = await getEditorActivity(editorJSON.id, startDate, Revision, endDate);

		const expectedResult = {
			'Jan-20': 1, 'Feb-20': 1, 'Mar-20': 1, 'Apr-20': 1, 'May-20': 1, 'Jun-20': 1, 'Jul-20': 1,
			'Aug-20': 1, 'Sep-20': 1, 'Oct-20': 1, 'Nov-20': 1, 'Dec-20': 1
		};

		expect(activity).to.deep.equal(expectedResult);
	});

	it('should give count months with zero or multiple revisions', async () => {
		const revisionAttribs = {
			authorId: editorJSON.id
		};
		const revisionsPromiseArray = [];
		for (let i = 0; i < 12; i += 2) {
			const tempDate = new Date();
			tempDate.setFullYear(2020, i, 1);
			revisionAttribs.createdAt = tempDate;
			revisionsPromiseArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(revisionsPromiseArray);

		const startDate = new Date();
		startDate.setFullYear(2020, 0, 1);
		const endDate = new Date();
		endDate.setFullYear(2020, 11, 1);
		const activity = await getEditorActivity(editorJSON.id, startDate, Revision, endDate);

		const expectedResult = {
			'Jan-20': 1, 'Feb-20': 0, 'Mar-20': 1, 'Apr-20': 0, 'May-20': 1, 'Jun-20': 0, 'Jul-20': 1,
			'Aug-20': 0, 'Sep-20': 1, 'Oct-20': 0, 'Nov-20': 1, 'Dec-20': 0
		};

		expect(activity).to.deep.equal(expectedResult);
	});

	it('should throw an error for an invalid startDate', async () => {
		const startDate = 'bob';
		const endDate = new Date();
		endDate.setFullYear(2020, 0, 1);
		try {
			await getEditorActivity(editorJSON.id, startDate, Revision, endDate);
		}
		catch (err) {
			const expectedError = new Error('Start date is invalid');
			expect(err.message).to.equal(expectedError.message);
		}
	});

	it('should throw an error for an invalid endDate', async () => {
		const startDate = new Date();
		startDate.setFullYear(2020, 0, 1);
		const endDate = 'bob';
		try {
			await getEditorActivity(editorJSON.id, startDate, Revision, endDate);
		}
		catch (err) {
			const expectedError = new Error('End date is invalid');
			expect(err.message).to.equal(expectedError.message);
		}
	});

	it('should throw an error when startDate is greater than endDate', async () => {
		const startDate = new Date();
		startDate.setFullYear(2020, 2, 1);
		const endDate = new Date();
		endDate.setFullYear(2020, 0, 1);

		try {
			await getEditorActivity(editorJSON.id, startDate, Revision, endDate);
		}
		catch (err) {
			const expectedError = new Error('Start date is greater than end date');
			expect(err.message).to.equal(expectedError.message);
		}
	});
});

describe('Editor with Administrator priv', () => {
	let agent;
	beforeEach(async () => {
		await createEditor(adminId, 16);
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	afterEach(truncateEntities);

	it('should be able to edit privs of an editor', async () => {
		await createEditor(targetUserId, oldPrivs);
		const note = 'testing';
		const data = {
			adminId,
			newPrivs,
			note,
			oldPrivs,
			targetUserId
		};

		const res = await agent.post('/editor/privs/edit/handler').send(data);
		const latestPrivsOfTargetUser = await Editor.query({where: {id: targetUserId}})
			.fetch({require: true})
			.then(editor => editor.get('privs'));
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
		expect(latestPrivsOfTargetUser).to.be.equal(newPrivs);
	});
});

describe('Editor without Administrator priv', () => {
	let agent;
	beforeEach(async () => {
		await createEditor(adminId, 15);
		agent = await chai.request.agent(app);
		await agent.get('/cb');
	});
	afterEach(truncateEntities);

	it('should not be able to edit privs of an editor', async () => {
		await createEditor(targetUserId, oldPrivs);
		const note = 'testing';
		const data = {
			adminId,
			newPrivs,
			note,
			oldPrivs,
			targetUserId
		};

		const res = await agent.post('/editor/privs/edit/handler').send(data);
		const latestPrivsOfTargetUser = await Editor.query({where: {id: targetUserId}})
			.fetch({require: true})
			.then(editor => editor.get('privs'));
		expect(res.ok).to.be.false;
		expect(res).to.have.status(403);
		expect(res.res.statusMessage).to.equal('You do not have the privilege to access this route');
		expect(latestPrivsOfTargetUser).to.be.equal(oldPrivs);
	});
});
