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
import {WikipediaArticleExtract, buildWikipediaUrl, getWikidataId} from '../../../../common/helpers/wikimedia';
import DOMPurify from 'isomorphic-dompurify';
import type {EntityT} from 'bookbrainz-data/lib/types/entity';
import React from 'react';
import {uniq} from 'lodash';


type State = {
	extract: string,
	url: URL,
};

type Props = {
	entity: EntityT,
} & Partial<State>;


/**
 * Fetches a Wikipedia extract for the given Wikidata item.
 * @param {string} wikidataId - Wikidata item ID.
 * @param {string[]} preferredLanguages - List of language codes, preference in descending order.
 */
async function getWikipediaExtractForWikidata(wikidataId: string, preferredLanguages = ['en']) {
	const apiUrl = new URL(`/wikidata/${wikidataId}/wikipedia-extract`, document.location.href);
	apiUrl.search = new URLSearchParams(preferredLanguages.map((lang) => ['language', lang])).toString();
	const response = await fetch(apiUrl);
	return response.json() as Promise<WikipediaArticleExtract>;
}


class WikipediaExtract extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			extract: props.extract,
			url: props.url
		};
	}

	componentDidMount() {
		if (!this.state.extract) {
			const wikidataId = getWikidataId(this.props.entity);
			if (!wikidataId) {
				return;
			}

			const aliasLanguages = this.props.entity.aliasSet?.aliases
				.map((alias) => alias.language?.isoCode1)
				// less common languages (and [Multiple languages]) do not have a two-letter ISO code, ignore them for now
				.filter((language) => language !== null)
				?? [];
			const preferredLanguages = uniq(['en', ...aliasLanguages]);

			getWikipediaExtractForWikidata(wikidataId, preferredLanguages).then((result) => {
				if (result.extract) {
					this.setState({
						extract: result.extract,
						url: buildWikipediaUrl(result.article)
					});
				}
			});
		}
	}

	render() {
		const {extract, url} = this.state;
		const licenseUrl = 'https://creativecommons.org/licenses/by-sa/3.0/';
		return extract ? (
			<Row className="wikipedia-extract">
				<Col>
					<h2>Wikipedia</h2>
					{/* eslint-disable-next-line react/no-danger */}
					<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(extract)}}/>
					<a href={url?.href}>Continue reading at Wikipedia...</a>
					{' '}
					<small>
						Wikipedia content provided under the terms of the <a href={licenseUrl}>Creative Commons BY-SA license</a>
					</small>
				</Col>
			</Row>
		) : null;
	}
}


export default WikipediaExtract;
