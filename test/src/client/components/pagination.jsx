/*
 * Copyright (C) 2026  Ansh Goyal
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {I18nextProvider, getI18n, setI18n} from 'react-i18next';
import {MemoryRouter, Route, Routes, useLocation} from 'react-router';
import {fireEvent, render, screen} from '@testing-library/react';
import Pagination from '../../../../src/client/components/pages/parts/pagination';
import React from 'react';
import {createI18n} from '../../../../src/common/i18n/i18n';
// eslint-disable-next-line import/no-internal-modules
import english from '../../../../public/locales/en/translation.json';
import {expect} from 'chai';


function ShowLocation() {
	const {search} = useLocation();
	return <output>{search}</output>;
}

let i18n;

function renderAt(url, props) {
	return render(
		<I18nextProvider i18n={i18n}>
			<MemoryRouter initialEntries={[url]}>
				<Routes>
					<Route element={<><Pagination {...props}/><ShowLocation/></>} path="/search"/>
				</Routes>
			</MemoryRouter>
		</I18nextProvider>
	);
}

describe('Pagination', () => {
	// createI18n makes its instance the global one, which the other tests use
	let previousI18n;
	before(() => {
		previousI18n = getI18n();
		i18n = createI18n('en', {en: {translation: english}});
	});
	after(() => {
		setI18n(previousI18n);
	});

	it('renders nothing when the page has no results', () => {
		const {container} = renderAt('/search?q=a', {from: 0, nextEnabled: false, shown: 0, size: 20});
		expect(container.querySelector('a, button')).to.be.null;
	});

	it('links to the next page and keeps the other parameters', () => {
		renderAt('/search?q=tolkien&type=work', {from: 0, nextEnabled: true, shown: 20, size: 20});
		expect(screen.getByText('Next Page →').closest('a').getAttribute('href'))
			.to.equal('/search?q=tolkien&type=work&from=20&size=20');
	});

	it('links to the previous page, never before the first result', () => {
		renderAt('/search?q=a&from=5&size=10', {from: 5, nextEnabled: false, shown: 10, size: 10});
		expect(screen.getByText('← Previous Page').closest('a').getAttribute('href'))
			.to.equal('/search?q=a&from=0&size=10');
	});

	it('disables the previous button on the first page and the next button on the last', () => {
		renderAt('/search?q=a', {from: 0, nextEnabled: false, shown: 3, size: 20});
		expect(screen.getByText('← Previous Page').closest('button').disabled).to.be.true;
		expect(screen.getByText('Next Page →').closest('button').disabled).to.be.true;
	});

	it('changes the page size and keeps the first result', () => {
		renderAt('/search?q=a&from=40&size=20', {from: 40, nextEnabled: true, shown: 20, size: 20});
		fireEvent.click(screen.getByText('20 per page', {selector: 'button'}));
		fireEvent.click(screen.getByText('50 per page'));
		expect(screen.getByRole('status').textContent).to.equal('?q=a&from=40&size=50');
	});
});
