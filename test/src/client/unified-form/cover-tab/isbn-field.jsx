// eslint-disable-next-line import/no-unassigned-import
import '../../../../test-helpers/setup';
import * as React from 'react';
import {expect, use} from 'chai';
import {fireEvent, render} from '@testing-library/react';
import ISBNField from '../../../../../src/client/unified-form/cover-tab/isbn-field';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
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
	let container;
	let dispatchSpy;
	beforeEach(() => {
		store = mockStore(initialState);
		dispatchSpy = spy();
		store.dispatch = dispatchSpy;
		({container} = render(
			<Provider store={store}>
				<ISBNField/>
			</Provider>
		));
	});
	it('should render with given state from Redux store', () => {
		expect(container.innerHTML).toMatchSnapshot();
	});
	it('should have correct default input value', () => {
		const inputEl = container.querySelector('input');
		expect(inputEl.value).to.equal(initialState.getIn(['ISBN', 'value']));
	});
	it('should correctly dispatch change input action', () => {
		const inputEl = container.querySelector('input');
		const newValue = '9783161484100';
		fireEvent.change(inputEl, {target: {value: newValue}});
		expect(dispatchSpy.callCount).equal(2);
		expect(dispatchSpy.args[0][0].payload).equal(9);
		expect(dispatchSpy.args[1][0].payload).equal(newValue);
	});
});
