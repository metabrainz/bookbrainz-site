// eslint-disable-next-line import/no-unassigned-import
import '../../../../test-helpers/setup';
import * as React from 'react';
import {expect, use} from 'chai';
import {fireEvent, render, screen} from '@testing-library/react';
import NameField from '../../../../../src/client/entity-editor/common/name-field';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

describe('NameField', () => {
	let onChangeSpy;
	let container;
	const label = 'SomeLabel';
	const tooltipText = 'Some tooltip text';
	beforeEach(() => {
		onChangeSpy = spy();
		({container} = render(<NameField label={label} tooltipText={tooltipText} onChange={onChangeSpy}/>));
	});
	it('should render correctly', () => {
		expect(container.innerHTML).toMatchSnapshot();
	});
	it('should call onChange when input changes', () => {
		fireEvent.change(container.querySelector('input'), {target: {value: 'new value'}});
		expect(onChangeSpy.calledOnce).to.be.true;
	});
	it('should have correct label', () => {
		expect(container.querySelector('span').textContent).include(label);
	});
	it('should have correct tooltip text', async () => {
		// The tooltip trigger is the help icon rendered inside the label
		fireEvent.mouseOver(container.querySelector('label > svg'));
		const tooltip = await screen.findByRole('tooltip');
		expect(tooltip.textContent).to.equal(tooltipText);
	});
});
