import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';
import {eachMonthOfInterval, format} from 'date-fns';

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
	const RevisionArray = [];
	before(async () => {
		const editor = await createEditor();
		editorJSON = editor.toJSON();
		const revisionAttribs = {
			authorId: editorJSON.id
		};

		for (let i = 0; i < 12; i++) {
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

	it('should return revision data for graph', async () => {
		const startDate = new Date();
		startDate.setFullYear(2019, 0, 1);
		const activityData = await getEditorActivity(editorJSON.id, startDate, Revision);

		// The result we expect from the function
		const expectedResults = {
			// eslint-disable-next-line sort-keys
			'Jan-19': 1, 'Feb-19': 1, 'Mar-19': 1, 'Apr-19': 1, 'May-19': 1, 'Jun-19': 1, 'Jul-19': 1,
			// eslint-disable-next-line sort-keys
			'Aug-19': 1, 'Sep-19': 1, 'Oct-19': 1, 'Nov-19': 1, 'Dec-19': 1
		};

		// Adds remaining months upto the present month
		const expectedStartDate = new Date();
		expectedStartDate.setFullYear(2020, 0, 1);
		const monthsUptoNow = eachMonthOfInterval({
			end: Date.now(),
			start: expectedStartDate
		})
			.map(month => format(new Date(month), 'LLL-yy'))
			.reduce((accumulator, month) => {
				accumulator[month] = 0;
				return accumulator;
			}, {});

		// Final result expected
		const expectedResultObject = {...expectedResults, ...monthsUptoNow};

		expect(activityData).to.deep.equal(expectedResultObject);
	});

	it('should give count months with zero or multi revisions', async () => {
		const revisionAttribs = {
			authorId: editorJSON.id
		};

		// Making some months with multiple and some with zero revisions
		for (let i = 0; i < 15; i += 2) {
			const tempDate = new Date();
			tempDate.setFullYear(2019, i, 1);
			revisionAttribs.id = random.number();
			revisionAttribs.createdAt = tempDate;
			RevisionArray.push(
				new Revision(revisionAttribs).save(null, {method: 'insert'})
			);
		}
		await Promise.all(RevisionArray);

		const startDate = new Date();
		startDate.setFullYear(2019, 0, 1);
		const activityData = await getEditorActivity(editorJSON.id, startDate, Revision);

		// The result we expect from the function
		const expectedResults = {
			// eslint-disable-next-line sort-keys
			'Jan-19': 2, 'Feb-19': 1, 'Mar-19': 2, 'Apr-19': 1, 'May-19': 2, 'Jun-19': 1, 'Jul-19': 2,
			// eslint-disable-next-line sort-keys
			'Aug-19': 1, 'Sep-19': 2, 'Oct-19': 1, 'Nov-19': 2, 'Dec-19': 1, 'Jan-20': 1, 'Feb-20': 0, 'Mar-20': 1
		};

		// Adds remaining months upto the present month
		const expectedStartDate = new Date();
		expectedStartDate.setFullYear(2020, 3, 1);
		const monthsUptoNow = eachMonthOfInterval({
			end: Date.now(),
			start: expectedStartDate
		})
			.map(month => format(new Date(month), 'LLL-yy'))
			.reduce((accumulator, month) => {
				accumulator[month] = 0;
				return accumulator;
			}, {});

		// Final result expected
		const expectedResultObject = {...expectedResults, ...monthsUptoNow};

		expect(activityData).to.deep.equal(expectedResultObject);
	});
});
