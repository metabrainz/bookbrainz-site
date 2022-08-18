import {initialEditionSection, isDetailTabEmpty} from '../../../../../src/client/unified-form/validators/detail-tab';
import {expect} from 'chai';


const emptyDetailTabState = {
	annotationSection: {
		content: ''
	},
	editionSection: initialEditionSection
};

describe('DetailTabValidators', () => {
	it('should be false for modified detail-tab state', () => {
		const detailTabState = {...emptyDetailTabState, annotationSection: {
			content: 'some annotation'
		}};
		const isEmpty = isDetailTabEmpty(detailTabState);
		expect(isEmpty).to.be.not.true;
	});
	it('should be true for unmodified detail-tab state', () => {
		const isEmpty = isDetailTabEmpty(emptyDetailTabState);
		expect(isEmpty).to.be.true;
	});
});
