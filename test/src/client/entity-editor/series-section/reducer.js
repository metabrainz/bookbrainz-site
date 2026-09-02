/* eslint-disable no-undefined */
import {
	ADD_BULK_SERIES_ITEMS
} from '../../../../../src/client/entity-editor/series-section/actions';
import {Map} from 'immutable';
import chai from 'chai';
import reducer from '../../../../../src/client/entity-editor/series-section/reducer';


const {expect} = chai;

function makeSeriesItem(rowID, attributeSetId = null, [position, number] = [null, null]) {
	return {
		attributeSetId,
		attributes: [
			{attributeType: 1, value: {textValue: position}},
			{attributeType: 2, value: {textValue: number}}
		],
		isAdded: false,
		isRemoved: false,
		relationshipType: {id: 71},
		rowID,
		sourceEntity: {bbid: `work-${rowID}`},
		targetEntity: {bbid: 'series'}
	};
}

describe('seriesSection reducer', () => {
	it('should preserve existing series items when bulk adding more items', () => {
		const stateWithExistingSeriesItems = reducer(undefined, {
			payload: {
				ws0: makeSeriesItem('ws0', 1)
			},
			type: ADD_BULK_SERIES_ITEMS
		});

		const nextState = reducer(stateWithExistingSeriesItems, {
			payload: {
				ws1: makeSeriesItem('ws1')
			},
			type: ADD_BULK_SERIES_ITEMS
		});

		const seriesItems = nextState.get('seriesItems');
		expect(Map.isMap(seriesItems)).to.be.true;
		expect(seriesItems.keySeq().toArray()).to.deep.equal(['ws0', 'ws1']);
		expect(seriesItems.getIn(['ws0', 'attributeSetId'])).to.equal(1);
		expect(seriesItems.getIn(['ws1', 'attributeSetId'])).to.equal(null);
	});

	it('should not concatenate attributes when bulk adding an existing row again', () => {
		const stateWithExistingSeriesItems = reducer(undefined, {
			payload: {
				ws0: makeSeriesItem('ws0', null, ['0', 'old'])
			},
			type: ADD_BULK_SERIES_ITEMS
		});

		const nextState = reducer(stateWithExistingSeriesItems, {
			payload: {
				ws0: makeSeriesItem('ws0', null, ['1', 'new'])
			},
			type: ADD_BULK_SERIES_ITEMS
		});

		const attributes = nextState.getIn(['seriesItems', 'ws0', 'attributes']);
		expect(attributes.size).to.equal(2);
		expect(attributes.getIn([0, 'value', 'textValue'])).to.equal('1');
		expect(attributes.getIn([1, 'value', 'textValue'])).to.equal('new');
	});
});
