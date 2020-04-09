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

		const RevisionArray = [];
		for (let i = 0; i <= 12; i++) {
			const tempDate = new Date();
			tempDate.setFullYear(2019, i, 1);
			revisionAttribs.id = random.number();
			revisionAttribs.createdAt = tempDate;
			RevisionArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(RevisionArray);
	});
	after(truncateEntities);

	it('should return values for plotting graph', async () => {
		const startDate = new Date();
		startDate.setFullYear(2019, 1, 1);
		const ActivityData = await getEditorActivity(editorJSON.id, startDate, Revision);
		const MonthArray = ['Jan-19', 'Feb-19', 'Mar-19', 'Apr-19', 'May-19', 'Apr-19', 'May-19',
			'Jun-19', 'Aug-19', 'Sep-19', 'Oct-19', 'Nov-19', 'Dec-19'];

		for (let i = 0; i < 12; i++) {
			expect(ActivityData[MonthArray[i]]).to.equal(1);
		}
	});
	it('should not miss any month in the returned object', async () => {
		const startDate = new Date();
		startDate.setFullYear(2019, 1, 1);
		const ActivityData = await getEditorActivity(editorJSON.id, startDate, Revision);
		const MonthArray = ['Jan-19', 'Feb-19', 'Mar-19', 'Apr-19', 'May-19', 'Apr-19', 'May-19',
			'Jun-19', 'Aug-19', 'Sep-19', 'Oct-19', 'Nov-19', 'Dec-19'];
		let count = 0;
		for (let i = 0; i < 12; i++) {
			if (ActivityData[MonthArray[i]]) {
				count++;
			}
		}
		expect(count).to.equal(12);
	});
});
