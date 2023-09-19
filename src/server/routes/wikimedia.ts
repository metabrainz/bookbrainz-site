/*
 * Copyright (C) 2023  David Kellner
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

import {getWikipediaExtract, selectWikipediaPage} from '../helpers/wikimedia';
import express from 'express';
import {getAcceptedLanguageCodes} from '../helpers/i18n';
import log from 'log';
import {parseQuery} from '../helpers/utils';


const router = express.Router();

router.get('/wikidata/:id/wikipedia-extract', async (req, res) => {
	const browserLanguages = getAcceptedLanguageCodes(req);
	// using `req.query.language` for a parameter that might be `string`, `string[]` (or something else) is a pain
	const queryLanguages = parseQuery(req.url).getAll('language');
	// try to use the user's browser languages, fallback to queried languages and English
	const preferredLanguages = browserLanguages.concat(queryLanguages, 'en');

	const wikidataId = req.params.id;
	try {
		const article = await selectWikipediaPage(wikidataId, {preferredLanguages});
		if (article) {
			const extract = await getWikipediaExtract(article);
			res.json({article, ...extract});
		}
		else {
			res.json({});
		}
	}
	catch (err) {
		log.warning(`Failed to load Wikipedia extract for ${wikidataId}: ${err.message}`);
		res.json({});
	}
});


export default router;
