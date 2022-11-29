// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import DateField from '../../../../../src/client/entity-editor/common/new-date-field';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';
import {spy} from 'sinon';


use(jestSnapshotPlugin());

describe('DateField', () => {
	let wrapper;
	it('should render correctly', () => {
		wrapper = mount(<DateField/>);
		expect(wrapper.html()).toMatchSnapshot();
	});
	it('should display given date correcly', () => {
		const isoDate = '+000012-12-14';
		const dummyLabel = 'SomeLabel';
		wrapper = mount(<DateField defaultValue={isoDate} empty={false} error={false} label={dummyLabel}/>);
		expect(wrapper.find('label span').text()).to.equal(dummyLabel);
		expect(wrapper.find('FormControl.year-field').props().value).to.equal('0012');
		const obj = wrapper.find('FormControl.other-date-field');
		expect(obj.at(0).props().value).to.equal('12');
		expect(obj.at(1).props().value).to.equal('14');
	});
	it('should call onChange callback with correct arguments', () => {
		const onChangeSpy = spy();
		wrapper = mount(<DateField onChangeDate={onChangeSpy}/>);
		const yearInput = wrapper.find('.year-field input');
		yearInput.simulate('change', {target: {value: '2022'}});
		expect(onChangeSpy.calledOnce).to.be.true;
		expect(onChangeSpy.args[0][0]).to.equal('+002022');
		const otherInput = wrapper.find('.other-date-field input');
		otherInput.at(0).simulate('change', {target: {value: '12'}});
		expect(onChangeSpy.calledTwice).to.be.true;
		expect(onChangeSpy.args[1][0]).to.equal('+002022-12');
		otherInput.at(1).simulate('change', {target: {value: '14'}});
		expect(onChangeSpy.calledThrice).to.be.true;
		expect(onChangeSpy.args[2][0]).to.equal('+002022-12-14');
	});
});
