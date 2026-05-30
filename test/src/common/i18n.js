/*
 * Copyright (C) 2026  Garv Thakre
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
import {createI18n} from '../../../src/common/i18n/i18n';


const {expect} = chai;


describe('createI18n', () => {
	it('should default to English when no locale is provided', () => {
		// eslint-disable-next-line no-undefined
		const i18n = createI18n(undefined, {en: {common: {}}});
		expect(i18n.language).to.equal('en');
	});

	it('should use the specified locale', () => {
		const i18n = createI18n('fr', {fr: {common: {'test.key': 'Bonjour'}}});
		expect(i18n.language).to.equal('fr');
	});

	it('should use pre-loaded resources for translation', () => {
		const resources = {en: {common: {'button.submit': 'Submit'}}};
		const i18n = createI18n('en', resources);
		expect(i18n.t('button.submit', {ns: 'common'})).to.equal('Submit');
	});

	it('should return the key when translation is missing', () => {
		const i18n = createI18n('en', {en: {common: {}}});
		expect(i18n.t('nonexistent.key', {ns: 'common'})).to.equal('nonexistent.key');
	});

	it('should initialize synchronously for SSR compatibility', () => {
		const i18n = createI18n('en', {en: {common: {'sync.test': 'Works'}}});
		// If initImmediate were true (default), translations would load
		// asynchronously and t() would return the raw key 'sync.test'
		// because renderToString() is synchronous and cannot await
		expect(i18n.t('sync.test', {ns: 'common'})).to.equal('Works');
	});
});
