// eslint-disable-next-line import/no-unassigned-import
import '../../../../test-helpers/setup';
import * as React from 'react';
import {expect, use} from 'chai';
import ValidationLabel from '../../../../../src/client/entity-editor/common/validation-label';
import {jestSnapshotPlugin} from 'mocha-chai-jest-snapshot';
import {render} from '@testing-library/react';


use(jestSnapshotPlugin());

describe('ValidationLabel', () => {
	it('should render correctly', () => {
		const {container} = render(<ValidationLabel/>);
		expect(container.innerHTML).toMatchSnapshot();
	});
	it('should show correct error messege on error', () => {
		const errorMessage = 'error message';
		const {container} = render(<ValidationLabel error errorMessage={errorMessage}/>);
		const spans = container.querySelectorAll('span');
		expect(spans[spans.length - 1].textContent).include(errorMessage);
	});
	it('should show correct warning messege on warning', () => {
		const warningMessage = 'warning message';
		const {container} = render(<ValidationLabel warn warnMessage={warningMessage}/>);
		const spans = container.querySelectorAll('span');
		expect(spans[spans.length - 1].textContent).include(warningMessage);
	});
	it('should show correct label', () => {
		const label = 'label';
		const {container} = render(<ValidationLabel>{label}</ValidationLabel>);
		expect(container.querySelector('span').textContent).include(label);
	});
	it('should show icon on entity editor', () => {
		const {container} = render(<ValidationLabel empty={false}/>);
		expect(container.querySelectorAll('svg').length).to.equal(1);
	});
	it('should not show icon when hideIcon is set', () => {
		const {container} = render(<ValidationLabel hideIcon empty={false}/>);
		expect(container.querySelectorAll('svg').length).to.equal(0);
	});
});
