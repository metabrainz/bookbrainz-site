import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import app from '../../../../src/server/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import {date} from 'faker';
import orm from '../../../bookbrainz-data';


chai.use(chaiHttp);
const {expect} = chai;

describe('GET Revision routes', () => {
	const {Revision} = orm;
	let editorJSON;
	before(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
		const revisionAttribs = {
			authorId: editorJSON.id,
			createdAt: date.recent(),
			id: 100000
		};
		new Revision(revisionAttribs).save(null, {method: 'insert'});
	});
	after(truncateEntities);
	it('should get /revision/id', async () => {
		const res = await chai.request(app)
			// eslint-disable-next-line no-undef
			.get(`/revision/${100000}`);
		expect(res.ok).to.be.true;
		expect(res).to.have.status(200);
	});
});
