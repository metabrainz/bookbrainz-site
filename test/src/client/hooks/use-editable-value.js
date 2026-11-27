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

import {act, renderHook} from '@testing-library/react';
import {expect} from 'chai';
import {useEditableValue} from '../../../../src/client/hooks/use-editable-value';


describe('useEditableValue', () => {
	it('starts with the value and keeps an edit', () => {
		const {result, rerender} = renderHook(({value}) => useEditableValue(value), {initialProps: {value: 'tolkien'}});
		expect(result.current[0]).to.equal('tolkien');
		act(() => {
			result.current[1]('hobbit');
		});
		rerender({value: 'tolkien'});
		expect(result.current[0]).to.equal('hobbit');
	});

	it('starts over when the value changes', () => {
		const {result, rerender} = renderHook(({value}) => useEditableValue(value), {initialProps: {value: 'tolkien'}});
		act(() => {
			result.current[1]('hobbit');
		});
		rerender({value: 'pratchett'});
		expect(result.current[0]).to.equal('pratchett');
	});
});
