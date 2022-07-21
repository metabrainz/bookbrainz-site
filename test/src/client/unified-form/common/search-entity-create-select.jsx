// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import {Provider} from 'react-redux';
import SearchEntityCreate from '../../../../../src/client/unified-form/common/search-entity-create-select';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {stub} from 'sinon';


use(jestSnapshotPlugin());

const props = {
	allIdentifierTypes: [],
	nextId: 0,
	type: 'Work'
};

const mockStore = configureStore();
describe('SearchEntityCreaateSelect', () => {
	let wrapper;
	let store;
	const formatCreateLabelSpy = stub();
	before(() => {
		store = mockStore();
		wrapper = mount(
			<Provider store={store}>
				<SearchEntityCreate {...props} formatCreateLabel={formatCreateLabelSpy}/>
			</Provider>
		);
	});
	it('renders correctly', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});
});

