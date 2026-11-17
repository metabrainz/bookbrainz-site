import * as React from 'react';
import {expect, use} from 'chai';
import {render, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import SearchEntityCreate from '../../../../../src/client/unified-form/common/search-entity-create-select';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {stableHtml} from '../../../../test-helpers/setup';
import {stub} from 'sinon';


use(jestSnapshotPlugin());

const props = {
	allIdentifierTypes: [],
	nextId: 0,
	type: 'Work'
};

const mockStore = configureStore();
// The async select shows a loading indicator until its default options are loaded
function waitForSelectsToLoad(container) {
	return waitFor(() => expect(container.querySelector('.react-select__loading-indicator')).to.equal(null));
}

describe('SearchEntityCreaateSelect', () => {
	let container;
	let store;
	const formatCreateLabelSpy = stub();
	beforeEach(() => {
		store = mockStore();
		({container} = render(
			<Provider store={store}>
				<SearchEntityCreate {...props} formatCreateLabel={formatCreateLabelSpy}/>
			</Provider>
		));
	});
	it('renders correctly', async () => {
		await waitForSelectsToLoad(container);
		expect(stableHtml(container)).toMatchSnapshot();
	});
});
