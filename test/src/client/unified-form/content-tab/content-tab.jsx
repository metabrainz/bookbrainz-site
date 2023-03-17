// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import {BASE_PROPS} from '../helpers';
import ContentTab from '../../../../../src/client/unified-form/content-tab/content-tab';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

const initialState = Immutable.fromJS({
	Works: {
		0: {},
		1: {}
	}
});
const props = {
	...BASE_PROPS
};

describe('ContentTab', () => {
	let store;
	let wrapper;
	let dispatchSpy;
	const newWork = {
		name: 'Dummy'
	};
	beforeEach(() => {
		store = configureStore()(initialState);
		dispatchSpy = spy();
		store.dispatch = dispatchSpy;
		wrapper = mount(
			<Provider store={store}>
				<ContentTab {...props}/>
			</Provider>
		);
	});

	it('should render correctly', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});

	it('should have correct number of work rows by default', () => {
		const rows = wrapper.find('WorkRow');
		expect(rows.length).to.equal(2);
	});

	it('should trigger add work action', () => {
		const select = wrapper.find('Select').at(2);
		select.props().onChange(newWork, {});
		expect(dispatchSpy.callCount).equal(1);
		const {payload} = dispatchSpy.args[0][0];
		expect(payload.value).equal(newWork);
	});

	it('should correctly set check property', () => {
		const select = wrapper.find('Select').at(2);
		const checkbox = wrapper.find('input.form-check-input').at(2);
		checkbox.simulate('change');
		select.props().onChange(newWork, {});
		expect(dispatchSpy.callCount).equal(1);
		const {payload} = dispatchSpy.args[0][0];
		expect(payload?.value?.checked).equal(true);
	});
});
