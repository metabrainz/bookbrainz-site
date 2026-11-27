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

import {expect} from 'chai';
import {postJSON} from '../../../../src/client/helpers/post-json';
import {stub} from 'sinon';


describe('postJSON', () => {
	let fetchStub;
	beforeEach(() => {
		fetchStub = stub(globalThis, 'fetch');
	});
	afterEach(() => {
		fetchStub.restore();
	});

	it('posts the data as JSON', async () => {
		fetchStub.resolves(new Response('{}', {status: 200}));
		expect(await postJSON('/handler', {a: 1})).to.deep.equal({ok: true});
		const [url, init] = fetchStub.firstCall.args;
		expect(url).to.equal('/handler');
		expect(init.method).to.equal('POST');
		expect(init.body).to.equal('{"a":1}');
		expect(init.headers['Content-Type']).to.equal('application/json; charset=utf-8');
	});

	it('gives the message of a failed request', async () => {
		fetchStub.resolves(new Response('{"error":"Name already in use"}', {status: 409}));
		expect(await postJSON('/handler', {})).to.deep.equal({error: 'Name already in use', ok: false});
	});

	it('gives no message when the answer has none', async () => {
		fetchStub.resolves(new Response('Bad Gateway', {status: 502}));
		expect(await postJSON('/handler', {})).to.deep.equal({error: null, ok: false});
	});

	it('gives no message when the error of the answer is not a string', async () => {
		fetchStub.resolves(new Response('{"error":42}', {status: 500}));
		expect(await postJSON('/handler', {})).to.deep.equal({error: null, ok: false});
	});

	it('gives no message when the network fails', async () => {
		fetchStub.rejects(new TypeError('Failed to fetch'));
		expect(await postJSON('/handler', {})).to.deep.equal({error: null, ok: false});
	});
});
