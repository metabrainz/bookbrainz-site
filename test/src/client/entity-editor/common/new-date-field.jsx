// eslint-disable-next-line import/no-unassigned-import
import '../../../../test-helpers/setup';
import * as React from 'react';
import {expect, use} from 'chai';
import {fireEvent, render} from '@testing-library/react';
import DateField from '../../../../../src/client/entity-editor/common/new-date-field';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

describe('DateField', () => {
	it('should render correctly', () => {
		const {container} = render(<DateField/>);
		expect(container.innerHTML).toMatchSnapshot();
	});
	it('should display given date correcly', () => {
		const isoDate = '+000012-12-14';
		const dummyLabel = 'SomeLabel';
		const {container} = render(<DateField defaultValue={isoDate} empty={false} error={false} label={dummyLabel}/>);
		expect(container.querySelector('label span').textContent).to.equal(dummyLabel);
		expect(container.querySelector('input.year-field').value).to.equal('0012');
		const otherInputs = container.querySelectorAll('input.other-date-field');
		expect(otherInputs[0].value).to.equal('12');
		expect(otherInputs[1].value).to.equal('14');
	});
	it('should call onChange callback with correct arguments', () => {
		const onChangeSpy = spy();
		const {container} = render(<DateField onChangeDate={onChangeSpy}/>);
		fireEvent.change(container.querySelector('input.year-field'), {target: {value: '2022'}});
		expect(onChangeSpy.calledOnce).to.be.true;
		expect(onChangeSpy.args[0][0]).to.equal('+002022');
		const otherInputs = container.querySelectorAll('input.other-date-field');
		fireEvent.change(otherInputs[0], {target: {value: '12'}});
		expect(onChangeSpy.calledTwice).to.be.true;
		expect(onChangeSpy.args[1][0]).to.equal('+002022-12');
		fireEvent.change(otherInputs[1], {target: {value: '14'}});
		expect(onChangeSpy.calledThrice).to.be.true;
		expect(onChangeSpy.args[2][0]).to.equal('+002022-12-14');
	});
});
