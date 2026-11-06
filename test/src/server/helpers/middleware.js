/*
 * Copyright (C) 2026  MetaBrainz Foundation
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

import chai from 'chai';
import {i18nMiddleware} from '../../../../src/server/helpers/middleware';


const {expect} = chai;


describe('i18nMiddleware', () => {
	function createMockReq(cookies = '', acceptLanguage = 'en') {
		return {
			headers: {
				'accept-language': acceptLanguage,
				cookie: cookies
			}
		};
	}

	function createMockRes() {
		return {
			locals: {}
		};
	}

	it('should set locale to "en" by default', async () => {
		const req = createMockReq();
		const res = createMockRes();
		let nextCalled = false;

		function next() {
			nextCalled = true;
		}

		await i18nMiddleware(req, res, next);

		expect(res.locals.locale).to.equal('en');
		expect(res.locals.currentLocale).to.equal('en');
		expect(nextCalled).to.be.true;
	});

	it('should read bb_lang cookie when present', async () => {
		const req = createMockReq('bb_lang=fr');
		const res = createMockRes();
		let nextCalled = false;

		function next() {
			nextCalled = true;
		}

		await i18nMiddleware(req, res, next);

		expect(res.locals.locale).to.equal('fr');
		expect(res.locals.currentLocale).to.equal('fr');
		expect(nextCalled).to.be.true;
	});

	it('should fall back to en for unsupported locale', async () => {
		const req = createMockReq('bb_lang=xyz');
		const res = createMockRes();
		let nextCalled = false;

		function next() {
			nextCalled = true;
		}

		await i18nMiddleware(req, res, next);

		expect(res.locals.locale).to.equal('en');
		expect(res.locals.currentLocale).to.equal('en');
		expect(nextCalled).to.be.true;
	});

	it('should set i18nResources as a plain object', async () => {
		const req = createMockReq();
		const res = createMockRes();
		let nextCalled = false;

		function next() {
			nextCalled = true;
		}

		await i18nMiddleware(req, res, next);

		expect(res.locals.i18nResources).to.be.an('object');
		expect(res.locals.i18nResources).to.not.be.null;
		expect(nextCalled).to.be.true;
	});

	it('should set availableLocales array', async () => {
		const req = createMockReq();
		const res = createMockRes();
		let nextCalled = false;

		function next() {
			nextCalled = true;
		}

		await i18nMiddleware(req, res, next);

		expect(res.locals.availableLocales).to.be.an('array');
		expect(res.locals.availableLocales).to.include('en');
		expect(nextCalled).to.be.true;
	});
});
