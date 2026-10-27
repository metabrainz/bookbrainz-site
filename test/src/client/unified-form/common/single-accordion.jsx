// eslint-disable-next-line import/no-unassigned-import
import '../../../../test-helpers/setup';
import * as React from 'react';
import {expect, use} from 'chai';
import SingleAccordion from '../../../../../src/client/unified-form/common/single-accordion';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {render} from '@testing-library/react';


use(jestSnapshotPlugin());


describe('SingleAccordion', () => {
	let container;
	const heading = 'BIGHEADING';
	const content = 'HELLOWORLD';
	beforeEach(() => {
		({container} = render(
			<SingleAccordion heading={heading}>
				<h1>{content}</h1>
			</SingleAccordion>
		));
	});
	it('renders correctly', () => {
		expect(container.innerHTML).toMatchSnapshot();
	});
	it('should have given heading', () => {
		expect(container.querySelector('.card-header').textContent).to.equal(heading);
	});
	it('should render the given children', () => {
		expect(container.querySelector('h1').textContent).to.equal(content);
	});
});
