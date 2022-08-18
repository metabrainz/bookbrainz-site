// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import {BASE_PROPS} from '../helpers';
import Immutable from 'immutable';
import {Provider} from 'react-redux';
import SummarySection from '../../../../../src/client/unified-form/submit-tab/summary';
import configureStore from 'redux-mock-store';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

const initialState = Immutable.fromJS({
	Authors: {},
	EditionGroups: {},
	Publishers: {},
	Works: {
		n0: {
			__isNew__: true,
			text: 'Dummy'
		}
	}
});

describe('SummarySection', () => {
	let store;
	let wrapper;
	let dispatchSpy;
	beforeEach(() => {
		store = configureStore()(initialState);
		dispatchSpy = spy();
		store.dispatch = dispatchSpy;
		wrapper = mount(
			<Provider store={store}>
				<SummarySection {...BASE_PROPS}/>
			</Provider>
		);
	});

	it('should render correctly', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});
	it('should show proper summary', () => {
		const summaries = wrapper.find('li');
		expect(summaries.length).to.equal(3);
		const worksPreview = summaries.last().find('span.entities-preview');
		expect(worksPreview.text()).to.equal('Dummy');
	});
});
