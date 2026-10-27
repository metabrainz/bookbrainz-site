// eslint-disable-next-line import/no-unassigned-import
import '../../../../test-helpers/setup';
import * as React from 'react';
import {expect, use} from 'chai';
import {BASE_PROPS} from '../helpers';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import SummarySection from '../../../../../src/client/unified-form/submit-tab/summary';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {render} from '@testing-library/react';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

const initialState = Immutable.fromJS({
	Authors: {},
	EditionGroups: {},
	Publishers: {},
	Series: {},
	Works: {
		n0: {
			__isNew__: true,
			id: 'w0',
			name: 'Dummy',
			text: 'Dummy',
			type: 'Work'
		}
	},
	nameSection: {
		disambiguation: '',
		language: 1,
		name: 'Dummy Edition',
		sortName: 'Dummy Edition'
	}
});

describe('SummarySection', () => {
	let store;
	let container;
	let dispatchSpy;
	beforeEach(() => {
		store = configureStore()(initialState);
		dispatchSpy = spy();
		store.dispatch = dispatchSpy;
		({container} = render(
			<Provider store={store}>
				<SummarySection {...BASE_PROPS}/>
			</Provider>
		));
	});

	it('should render correctly', () => {
		expect(container.innerHTML).toMatchSnapshot();
	});
	it('should show a card for each new entity', () => {
		// The edition group is created implicitly together with the edition
		const headers = Array.from(container.querySelectorAll('.review-card .card-header')).map((el) => el.textContent);
		expect(headers).to.deep.equal(['Dummy Edition', 'Dummy Edition', 'Dummy']);
	});
	it('should only list entities that are newly created', () => {
		const existingWork = Immutable.fromJS({id: 'w1', name: 'Existing', text: 'Existing', type: 'Work'});
		const initialStateWithExisting = initialState.setIn(['Works', 'n1'], existingWork);
		const {container: other} = render(
			<Provider store={configureStore()(initialStateWithExisting)}>
				<SummarySection {...BASE_PROPS}/>
			</Provider>
		);
		expect(other.textContent).not.to.include('Existing');
	});
});
