import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import chai from 'chai';
import chaiHttp from 'chai-http';
import {getEditorActivity} from '../../../../src/server/routes/editor.js';
import orm from '../../../bookbrainz-data';
import {random} from 'faker';


chai.use(chaiHttp);
const {expect} = chai;


describe('getEditorActivity', () => {
	const {Revision} = orm;
	let editorJSON;
	before(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
		const revisionAttribs = {
			authorId: editorJSON.id
		};
		const revisionsPromiseArray = [];
		for (let i = 0; i < 6; i++) {
			const tempDate = new Date();
			tempDate.setFullYear(2020, i, 1);
			revisionAttribs.id = random.number();
			revisionAttribs.createdAt = tempDate;
			revisionsPromiseArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(revisionsPromiseArray);
	});
	after(truncateEntities);

	it('should return revision data for graph', async () => {
		const startDate = new Date();
		startDate.setFullYear(2020, 0, 1);
		const endDate = new Date();
		endDate.setFullYear(2020, 5, 1);
		const activity = await getEditorActivity(editorJSON.id, startDate, Revision, endDate);

		const expectedResult = {
			// eslint-disable-next-line sort-keys
			'Jan-20': 1, 'Feb-20': 1, 'Mar-20': 1, 'Apr-20': 1, 'May-20': 1, 'Jun-20': 1
		};

		expect(activity).to.deep.equal(expectedResult);
	});

	it('should give count months with zero or multi revisions', async () => {
		const revisionAttribs = {
			authorId: editorJSON.id
		};
		const revisionsPromiseArray = [];
		for (let i = 0; i < 12; i += 2) {
			const tempDate = new Date();
			tempDate.setFullYear(2020, i, 1);
			revisionAttribs.id = random.number();
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
			// eslint-disable-next-line sort-keys
			'Jan-20': 2, 'Feb-20': 1, 'Mar-20': 2, 'Apr-20': 1, 'May-20': 2, 'Jun-20': 1, 'Jul-20': 1,
			// eslint-disable-next-line sort-keys
			'Aug-20': 0, 'Sep-20': 1, 'Oct-20': 0, 'Nov-20': 1, 'Dec-20': 0
		};

		expect(activity).to.deep.equal(expectedResult);
	});
});
