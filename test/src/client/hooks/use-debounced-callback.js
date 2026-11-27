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
import {spy, useFakeTimers} from 'sinon';
import {expect} from 'chai';
import {useDebouncedCallback} from '../../../../src/client/hooks/use-debounced-callback';


describe('useDebouncedCallback', () => {
	let clock;
	beforeEach(() => {
		clock = useFakeTimers();
	});
	afterEach(() => {
		clock.restore();
	});

	it('calls the callback once, with the last arguments, after the delay', () => {
		const callback = spy();
		const {result} = renderHook(() => useDebouncedCallback(callback, 100));
		act(() => {
			result.current('a');
			result.current('ab');
		});
		clock.tick(99);
		expect(callback.called).to.be.false;
		clock.tick(1);
		expect(callback.calledOnceWithExactly('ab')).to.be.true;
	});

	it('calls the callback of the latest render', () => {
		const first = spy();
		const second = spy();
		const {result, rerender} = renderHook(({callback}) => useDebouncedCallback(callback, 100), {initialProps: {callback: first}});
		act(() => {
			result.current('a');
		});
		rerender({callback: second});
		clock.tick(100);
		expect(first.called).to.be.false;
		expect(second.calledOnceWithExactly('a')).to.be.true;
	});

	it('drops a pending call on unmount', () => {
		const callback = spy();
		const {result, unmount} = renderHook(() => useDebouncedCallback(callback, 100));
		act(() => {
			result.current('a');
		});
		unmount();
		clock.tick(100);
		expect(callback.called).to.be.false;
	});
});
