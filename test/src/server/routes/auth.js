import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {get} from 'lodash';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
const {expect} = chai;
const {Editor} = orm;

const deletedUserAttrib = {
	areaId: null,
	bio: '',
	cachedMetabrainzName: null,
	genderId: null,
	metabrainzUserId: null,
	revisionsApplied: 0,
	revisionsReverted: 0,
	titleUnlockId: null,
	totalRevisions: 0
};

function verifyDeletedUser(user) {
	if (!get(user, 'name', '').includes('Deleted User')) { return false; }
	for (const key in deletedUserAttrib) {
		if (Object.hasOwnProperty.call(deletedUserAttrib, key)) {
			if (get(user, key) !== get(user, key, null)) {
				return false;
			}
		}
	}
	return true;
}
describe('delete user', () => {
	const adminEditorId = 1;
	const adminEditorName = 'UserDeleter';
	const userEditorId = 2;
	const userEditorName = 'NormalUser1';
	const otherEditorId = 3;
	const otherEditorName = 'NormalUser2';
	let agent;
	before(async () => {
		await createEditor(adminEditorId, {name: adminEditorName});
		await createEditor(userEditorId, {name: userEditorName});
		await createEditor(otherEditorId, {name: otherEditorName});
		agent = chai.request.agent(app);
		await agent.get('/cb');
	});
	after(truncateEntities);
	it('Normal User should not be able to delete other users', async () => {
		const res = await agent.post(`/delete-user/${otherEditorName}?access_token=${userEditorId}`);
		expect(res.ok).to.be.false;
		// unauthorized
		expect(res.status).to.be.equal(401);
	});
	it('User Deleter should be able to delete a user', async () => {
		const res = await agent.post(`/delete-user/${userEditorName}?access_token=${adminEditorId}`);
		expect(res.ok).to.be.true;
		const editor = await new Editor({id: userEditorId}).fetch();
		expect(editor).to.exist;
		expect(verifyDeletedUser(editor.toJSON())).to.be.true;
	});
});
