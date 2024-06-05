// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import ISBNField from '../../../../../src/client/unified-form/cover-tab/isbn-field';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

const initialState = Immutable.fromJS(
	{
		ISBN: {
			type: 1,
			value: 'nbsi'
		}
	}
);
const mockStore = configureStore();
describe('ISBNField', () => {
	let store;
	let wrapper;
	const dispatchSpy = spy();
	before(() => {
		store = mockStore(initialState);
		store.dispatch = dispatchSpy;
		wrapper = mount(
			<Provider store={store}>
				<ISBNField/>
			</Provider>
		);
	});
	it('should render with given state from Redux store', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});
	it('should have correct default input value', () => {
		const inputEl = wrapper.find('input');
		expect(inputEl.props().defaultValue).to.equal(initialState.getIn(['ISBN', 'value']));
	});
	it('should correctly dispatch change input action', () => {
		const inputEl = wrapper.find('input');
		const newValue = '9783161484100';
		inputEl.simulate('change', {target: {value: newValue}});
		expect(dispatchSpy.callCount).equal(2);
		expect(dispatchSpy.args[0][0].payload).equal(9);
		expect(dispatchSpy.args[1][0].payload).equal(newValue);
	});
});
