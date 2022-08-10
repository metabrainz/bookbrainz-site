// eslint-disable-next-line import/no-unassigned-import
import '../../../../../enzyme.config';
import * as React from 'react';
import {expect, use} from 'chai';
import ValidationLabel from '../../../../../src/client/entity-editor/common/validation-label';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {mount} from 'enzyme';


use(jestSnapshotPlugin());

describe('ValidationLabel', () => {
	it('should render correctly', () => {
		const wrapper = mount(<ValidationLabel/>);
		expect(wrapper.html()).toMatchSnapshot();
	});
	it('should show correct error messege on error', () => {
		const errorMessage = 'error message';
		const wrapper = mount(<ValidationLabel error errorMessage={errorMessage}/>);
		expect(wrapper.find('span').last().text()).include(errorMessage);
	});
	it('should show correct warning messege on warning', () => {
		const warningMessage = 'warning message';
		const wrapper = mount(<ValidationLabel warn warnMessage={warningMessage}/>);
		expect(wrapper.find('span').last().text()).include(warningMessage);
	});
	it('should show correct label', () => {
		const label = 'label';
		const wrapper = mount(<ValidationLabel>{label}</ValidationLabel>);
		expect(wrapper.find('span').first().text()).include(label);
	});
	it('should show icon on entity editor', () => {
		const wrapper = mount(<ValidationLabel empty={false}/>);
		expect(wrapper.find('FontAwesomeIcon').length).to.equal(1);
	});
	it('should not show icon on unified form editor', () => {
		const wrapper = mount(<ValidationLabel isUnifiedForm empty={false}/>);
		expect(wrapper.find('FontAwesomeIcon').length).to.equal(0);
	});
});
