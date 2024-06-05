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

import {Col, Row} from 'react-bootstrap';
import React, {useEffect, useState} from 'react';
import {WikipediaArticleExtract, buildWikipediaUrl, getWikidataId} from '../../../../common/helpers/wikimedia';
import DOMPurify from 'isomorphic-dompurify';
import type {LazyLoadedEntityT} from 'bookbrainz-data/lib/types/entity';
import {getAliasLanguageCodes} from '../../../../common/helpers/utils';
import {uniq} from 'lodash';


type Props = {
	entity: LazyLoadedEntityT,
	articleExtract?: WikipediaArticleExtract,
};


/**
 * Fetches a Wikipedia extract for the given Wikidata item.
 * @param {string} wikidataId - Wikidata item ID.
 * @param {string[]} preferredLanguages - List of language codes, preference in descending order.
 */
async function getWikipediaExtractForWikidata(wikidataId: string, preferredLanguages: string[] = ['en']) {
	const apiUrl = new URL(`/wikidata/${wikidataId}/wikipedia-extract`, document.location.href);
	apiUrl.search = new URLSearchParams(preferredLanguages.map((lang) => ['language', lang])).toString();
	const response = await fetch(apiUrl);
	return response.json() as Promise<WikipediaArticleExtract>;
}


function WikipediaExtract({entity, articleExtract}: Props) {
	const [state, setState] = useState(articleExtract);

	useEffect(() => {
		if (!state.extract) {
			const wikidataId = getWikidataId(entity);
			if (!wikidataId) {
				return;
			}

			const aliasLanguages = getAliasLanguageCodes(entity);
			const preferredLanguages = uniq(['en', ...aliasLanguages]);

			getWikipediaExtractForWikidata(wikidataId, preferredLanguages).then((result) => {
				if (result.extract) {
					setState(result);
				}
			}).catch((error) => {
				// eslint-disable-next-line no-console -- no other logger available for browser
				console.warn('Failed to load Wikipedia extract:', error);
			});
		}
	}, [entity]);

	const {extract, article} = state;
	const licenseUrl = 'https://creativecommons.org/licenses/by-sa/3.0/';

	return extract ? (
		<Row className="wikipedia-extract">
			<Col>
				<h2>Wikipedia</h2>
				{/* eslint-disable-next-line react/no-danger */}
				<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(extract)}}/>
				<a href={buildWikipediaUrl(article)?.href}>Continue reading at Wikipedia...</a>
				{' '}
				<small>
					Wikipedia content provided under the terms of the <a href={licenseUrl}>Creative Commons BY-SA license</a>
				</small>
			</Col>
		</Row>
	) : null;
}

WikipediaExtract.defaultProps = {
	articleExtract: {}
};


export default WikipediaExtract;
