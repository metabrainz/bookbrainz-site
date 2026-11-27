/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
 *               2018  Nicolas Pelleiter
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

import CallToAction from './parts/call-to-action';
import type {EntityIconType} from '../../helpers/entity-icon';
import Pagination from './parts/pagination';
import React from 'react';
import SearchField from './parts/search-field';
import type {SearchResult} from '../../../common/types/search';
import SearchResults from './parts/search-results';
import type {SiteUser} from '../../../common/types/site';
import {useTranslation} from 'react-i18next';


type Props = {
	entityTypes: EntityIconType[],
	from: number,
	initialResults: SearchResult[],
	nextEnabled: boolean,
	query: string,
	resultsPerPage: number,
	type?: string | null,
	user?: SiteUser | null
};

// The query, the entity type and the page are in the address; the route's loader searches for them
export default function SearchPage({entityTypes, from, initialResults, nextEnabled, query, resultsPerPage, type = null, user = null}: Props) {
	const {t: translate} = useTranslation();

	return (
		<div id="pageWithPagination">
			<SearchField
				entityTypes={entityTypes}
				query={query}
				type={type ?? ''}
			/>
			<SearchResults
				results={initialResults}
				user={user}
			/>
			<Pagination
				from={from}
				nextEnabled={nextEnabled}
				shown={initialResults.length}
				size={resultsPerPage}
			/>
			<div className="text-center">
				{initialResults.length === 0 &&
				<div>
					<hr className="thin"/>
					<h2 style={{color: '#754e37'}}>
						{translate('pages.searchPage.noResults')}
					</h2>
				</div>}

				<div>
					{initialResults.length === 0 &&
						<small>
							{translate('pages.searchPage.spellingWarning')}
						</small>}
					<hr className="wide"/>
					<h3>{translate('pages.searchPage.missingEntry')}</h3>
					<CallToAction query={query}/>
				</div>

			</div>
		</div>
	);
}
