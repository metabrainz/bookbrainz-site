// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import NameField from '../../../../../src/client/entity-editor/common/name-field';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

describe('NameField', () => {
	let onChangeSpy;
	let wrapper;
	const label = 'SomeLabel';
	const tooltipText = 'Some tooltip text';
	before(() => {
		onChangeSpy = spy();
		wrapper = mount(<NameField label={label} tooltipText={tooltipText} onChange={onChangeSpy}/>);
	});
	it('should render correctly', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});
	it('should call onChange when input changes', () => {
		const input = wrapper.find('input');
		input.simulate('change', {target: {value: 'new value'}});
		expect(onChangeSpy.calledOnce).to.be.true;
	});
	it('should have correct label', () => {
		expect(wrapper.find('span').first().text()).include(label);
	});
	it('should have correct tooltip text', async () => {
		wrapper.find('OverlayTrigger').simulate('mouseover');
		await new Promise((foo) => setTimeout(foo, 50));
		wrapper.update();
		const tooltip = wrapper.find('Tooltip');
		expect(tooltip.text()).to.equal(tooltipText);
	});
});
