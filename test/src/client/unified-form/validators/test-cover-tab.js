import {isCoverTabEmpty, validateISBN} from '../../../../../src/client/unified-form/validators/cover-tab';
import {emptyCoverTabState} from '../helpers';
import {expect} from 'chai';


function describeISBNState() {
	it('should be false for invalid isbn type', () => {
		const isbn = {
			type: null,
			value: 'someisbn'
		};
		const isValid = validateISBN(isbn);
		expect(isValid).to.be.not.true;
	});
	it('should be true for valid isbn type', () => {
		const isbn = {
			type: 1,
			value: 'someisbn'
		};
		const isValid = validateISBN(isbn);
		expect(isValid).to.be.true;
	});
}
function describeCoverTabValidators() {
	it('should be false for modified cover tab state', () => {
		const coverTabState = {...emptyCoverTabState, ISBN: {type: 1, value: 'someisbn'}};
		const isEmpty = isCoverTabEmpty(coverTabState);
		expect(isEmpty).to.be.not.true;
	});
	it('should be true for unmodified cover tab state', () => {
		const coverTabState = {...emptyCoverTabState};
		const isEmpty = isCoverTabEmpty(coverTabState);
		expect(isEmpty).to.be.true;
	});
}

function tests() {
	describe('validateISBNState', describeISBNState);
	describe('validateCoverTabState', describeCoverTabValidators);
}

describe('CoverTabValidators', tests);
