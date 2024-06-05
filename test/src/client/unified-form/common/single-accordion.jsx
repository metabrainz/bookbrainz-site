// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import SingleAccordion from '../../../../../src/client/unified-form/common/single-accordion';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';


use(jestSnapshotPlugin());


describe('SingleAccordion', () => {
	let wrapper;
	const heading = 'BIGHEADING';
	const content = 'HELLOWORLD';
	before(() => {
		wrapper = mount(
			<SingleAccordion heading={heading}>
				<h1>{content}</h1>
			</SingleAccordion>
		);
	});
	it('renders correctly', () => {
		expect(wrapper.html()).toMatchSnapshot();
	});
	it('should have given heading', () => {
		expect(wrapper.find('ValidationLabel').text()).to.equal(heading);
	});
	it('should render the given children', () => {
		expect(wrapper.find('h1').text()).to.equal(content);
	});
});
