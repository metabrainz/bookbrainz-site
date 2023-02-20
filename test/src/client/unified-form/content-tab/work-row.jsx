// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import {BASE_PROPS} from '../helpers';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import WorkRow from '../../../../../src/client/unified-form/content-tab/work-row';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

const initialState = Immutable.fromJS({
	Works: {
		n0: {
			id: 0
		}
	}
});
const props = {
	...BASE_PROPS
};

describe('WorkRow', () => {
	let store;
	let wrapper;
	let dispatchSpy;
	beforeEach(() => {
		store = configureStore()(initialState);
		dispatchSpy = spy();
		store.dispatch = dispatchSpy;
		wrapper = mount(
			<Provider store={store}>
				<WorkRow {...props} rowId="n0"/>
			</Provider>
		);
	});

	it('should render correctly', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});

	it('should trigger delete work action', () => {
		const deleteButton = wrapper.find('button.btn-danger').at(0);
		deleteButton.simulate('click');
		const payload = dispatchSpy.args[0][0];
		expect(dispatchSpy.callCount).equal(1);
		expect(payload.type).equal('REMOVE_WORK');
		expect(payload.payload).equal('n0');
	});

	it('should update the work value', () => {
		const select = wrapper.find('Select').at(0);
		select.props().onChange({name: 'Dummy'}, {});
		const payload = dispatchSpy.args[0][0];
		expect(dispatchSpy.callCount).equal(1);
		expect(payload.type).equal('UPDATE_WORK');
		expect(payload.payload.id).equal('n0');
		expect(payload?.payload?.value?.name).equal('Dummy');
	});

	it('should update checkbox on toggle', () => {
		const checkbox = wrapper.find('input.form-check-input').at(0);
		checkbox.simulate('change');
		const payload = dispatchSpy.args[0][0];
		expect(dispatchSpy.callCount).equal(1);
		expect(payload.type).equal('TOGGLE_COPY_AUTHOR_CREDITS');
		expect(payload.payload).equal('n0');
	});
});
