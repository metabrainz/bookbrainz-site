import * as React from 'react';
import {expect, use} from 'chai';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {restore, spy, stub} from 'sinon';
import {BASE_PROPS} from '../helpers';
import ContentTab from '../../../../../src/client/unified-form/content-tab/content-tab';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import request from 'superagent';
import {stableHtml} from '../../../../test-helpers/setup';


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

describe('ContentTab', () => {
	let store;
	let container;
	let dispatchSpy;
	// Picks the search result "Dummy" in the select that adds a new work
	async function addDummyWork() {
		const inputs = container.querySelectorAll('input[id^="react-select"]');
		// Two existing work rows come first, the "add work" select is the last one
		const addWorkInput = inputs[inputs.length - 1];
		fireEvent.change(addWorkInput, {target: {value: 'Dummy'}});
		const option = await screen.findByText(isSearchResultOption, {}, {timeout: SEARCH_TIMEOUT});
		fireEvent.click(option);
	}
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
				<ContentTab {...props}/>
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

	it('should have correct number of work rows by default', () => {
		expect(container.querySelectorAll('.work-item').length).to.equal(2);
	});

	it('should trigger add work action', async () => {
		await addDummyWork();
		expect(dispatchSpy.callCount).equal(1);
		const {payload} = dispatchSpy.args[0][0];
		expect(payload.value.text).equal('Dummy');
		expect(payload.value.id).equal('00000000-0000-4000-8000-000000000001');
	});

	it('should mark the new work as checked by default', async () => {
		await addDummyWork();
		const {payload} = dispatchSpy.args[0][0];
		expect(payload?.value?.checked).equal(true);
	});

	it('should correctly set check property', async () => {
		// Checkboxes: one per existing work row (2), then "Copy Authors from Author Credit"
		const checkboxes = container.querySelectorAll('input.form-check-input');
		fireEvent.click(checkboxes[2]);
		await addDummyWork();
		expect(dispatchSpy.callCount).equal(1);
		const {payload} = dispatchSpy.args[0][0];
		expect(payload?.value?.checked).equal(false);
	});
});
