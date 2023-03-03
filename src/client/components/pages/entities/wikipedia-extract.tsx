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
import {WikipediaArticleExtract, buildWikipediaUrl} from '../../../../common/helpers/wikimedia';
import React from 'react';


type State = {
	extract: string,
	url: URL,
};

type Props = {
	entity: {
		identifierSet: {
			identifiers: Array<{
				typeId: number,
				value: string,
			}>,
		},
	},
} & Partial<State>;


/**
 * Fetches a Wikipedia extract for the given Wikidata item.
 * @param wikidataId - Wikidata item ID.
 */
async function getWikipediaExtractForWikidata(wikidataId: string) {
	const response = await fetch(`/wikipedia-extract/wikidata/${wikidataId}`);
	return response.json() as Promise<WikipediaArticleExtract>;
}


const WIKIDATA_TYPE_ID = 18;


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
			const identifiers = this.props.entity.identifierSet?.identifiers;
			if (!identifiers?.length) {
				return;
			}

			const wikidataId = identifiers.find((identifier) => identifier.typeId === WIKIDATA_TYPE_ID)?.value;
			getWikipediaExtractForWikidata(wikidataId).then((result) => {
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
		return extract ? (
			<Row className="wikipedia-extract">
				<Col>
					<h2>Wikipedia</h2>
					<div dangerouslySetInnerHTML={{__html: extract}}/>
					<a href={url?.href}>Continue reading at Wikipedia...</a>
					{' '}
					<small>
						{'Wikipedia content provided under the terms of the '}
						<a href="https://creativecommons.org/licenses/by-sa/3.0/">Creative Commons BY-SA license</a>
					</small>
				</Col>
			</Row>
		) : null;
	}
}


export default WikipediaExtract;
