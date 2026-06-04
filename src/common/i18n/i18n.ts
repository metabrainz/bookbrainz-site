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

import HttpBackend from 'i18next-http-backend';
import LangDetector from 'i18next-browser-languagedetector';
import {createInstance} from 'i18next';
import {initReactI18next} from 'react-i18next';


const isServer = typeof window === 'undefined';

export function createI18n(locale = 'en', resources?) {
	const instance = createInstance();
	instance.use(initReactI18next);

	const hasResources = resources && Object.keys(resources).length > 0;

	if (!hasResources && !isServer) {
		// Browser with no pre-loaded resources — fetch translations over HTTP.
		// In normal page loads this branch is never hit because the server injects
		// resources into the #props script tag. It exists as a safety fallback.
		instance.use(HttpBackend).use(LangDetector);
	}

	instance.init({
		fallbackLng: 'en',
		initImmediate: false,
		lng: locale,
		ns: ['common', 'entityEditor', 'pages', 'entities', 'errors'],
		...hasResources ? {resources} : {backend: {loadPath: '/locales/{{lng}}/{{ns}}.json'}}
	});

	return instance;
}
