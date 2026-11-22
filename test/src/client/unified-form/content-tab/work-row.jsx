import * as React from 'react';
import {expect, use} from 'chai';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {restore, spy, stub} from 'sinon';
import {BASE_PROPS} from '../helpers';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import WorkRow from '../../../../../src/client/unified-form/content-tab/work-row';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import request from 'superagent';
import {stableHtml} from '../../../../test-helpers/setup';


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
// The search select waits this long (plus the request) before showing options
const SEARCH_TIMEOUT = 5000;
// The "Create ..." option also contains the typed text, so only match the actual search result
function isSearchResultOption(_, element) {
	return element.classList.contains('react-select__option') &&
		(/Dummy/).test(element.textContent) && !(/Create/).test(element.textContent);
}

// The async select shows a loading indicator until its default options are loaded
function waitForSelectsToLoad(container) {
	return waitFor(() => expect(container.querySelector('.react-select__loading-indicator')).to.equal(null));
}

describe('WorkRow', () => {
	let store;
	let container;
	let dispatchSpy;
	beforeEach(() => {
		stub(request, 'get').callsFake(() => ({
			query: () => Promise.resolve({
				body: [{
					bbid: '00000000-0000-4000-8000-000000000001',
					defaultAlias: {name: 'Dummy'},
					type: 'Work'
				}]
			})
		}));
		store = configureStore()(initialState);
		dispatchSpy = spy();
		store.dispatch = dispatchSpy;
		({container} = render(
			<Provider store={store}>
				<WorkRow {...props} rowId="n0"/>
			</Provider>
		));
	});
	afterEach(() => {
		restore();
	});

	it('should render correctly', async () => {
		await waitForSelectsToLoad(container);
		expect(stableHtml(container)).toMatchSnapshot();
	});

	it('should trigger delete work action', () => {
		fireEvent.click(container.querySelector('button.btn-danger'));
		const payload = dispatchSpy.args[0][0];
		expect(dispatchSpy.callCount).equal(1);
		expect(payload.type).equal('REMOVE_WORK');
		expect(payload.payload).equal('n0');
	});

	it('should update the work value', async () => {
		const input = container.querySelector('input[id^="react-select"]');
		fireEvent.change(input, {target: {value: 'Dummy'}});
		const option = await screen.findByText(isSearchResultOption, {}, {timeout: SEARCH_TIMEOUT});
		fireEvent.click(option);
		const payload = dispatchSpy.args[0][0];
		expect(dispatchSpy.callCount).equal(1);
		expect(payload.type).equal('UPDATE_WORK');
		expect(payload.payload.id).equal('n0');
		expect(payload?.payload?.value?.text).equal('Dummy');
	});

	it('should update checkbox on toggle', () => {
		fireEvent.click(container.querySelector('input.form-check-input'));
		const payload = dispatchSpy.args[0][0];
		expect(dispatchSpy.callCount).equal(1);
		expect(payload.type).equal('TOGGLE_COPY_AUTHOR_CREDITS');
		expect(payload.payload).equal('n0');
	});
});
