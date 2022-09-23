import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import config from '../../../../superagent-mock-config';
import mock from 'superagent-mock';
import {omit} from 'lodash';
import orm from '../../../bookbrainz-data';
import request from 'superagent';


mock(request, config);

chai.use(chaiHttp);
const {expect} = chai;
const {Editor} = orm;

const deletedUserAttrib = {
	areaId: null,
	bio: '',
	cachedMetabrainzName: null,
	genderId: null,
	id: 2,
	metabrainzUserId: null,
	name: 'Deleted User #2',
	reputation: 0,
	revisionsApplied: 0,
	revisionsReverted: 0,
	titleUnlockId: null,
	totalRevisions: 0
};

describe('delete user', () => {
	const adminEditorId = 1;
	const userEditorId = 2;
	const userMBId = 2;
	const otherEditorId = 3;
	let agent;
	before(async () => {
		await createEditor(userEditorId, {metabrainzUserId: userMBId});
		agent = chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);
	it('Normal User should not be able to delete other users', async () => {
		const res = await agent.post(`/delete-user/${userMBId}?access_token=${otherEditorId}`);
		expect(res.ok).to.be.false;
		// unauthorized
		expect(res.status).to.be.equal(401);
	});
	it('User Deleter should be able to delete a user', async () => {
		const res = await agent.post(`/delete-user/${userMBId}?access_token=${adminEditorId}`);
		expect(res.ok).to.be.true;
		const editor = await new Editor({id: userEditorId}).fetch();
		expect(editor).to.exist;
		const editorJson = omit(editor.toJSON(), ['activeAt', 'createdAt', 'typeId']);
		expect(editorJson).to.deep.equal(deletedUserAttrib);
	});
});
