/*
 * Copyright (C) 2020 Prabal Singh
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


import React, {useState} from 'react';
import PagerElement from './parts/pager';
import RevisionsTable from './parts/revisions-table';
import {useTranslation} from 'react-i18next';


const PAGINATION_URL = './revisions/revisions';

type Props = {
	from?: number,
	nextEnabled: boolean,
	results?: unknown[],
	showEntities?: boolean,
	showRevisionEditor?: boolean,
	size?: number
};

export default function RevisionsPage({from = 0, nextEnabled, results = [], showEntities = true, showRevisionEditor = true, size = 20}: Props) {
	const {t: translate} = useTranslation();
	const [currentResults, setCurrentResults] = useState(results);

	return (
		<div id="pageWithPagination">
			<RevisionsTable
				results={currentResults}
				showEntities={showEntities}
				showRevisionEditor={showRevisionEditor}
				tableHeading={translate('pages.revisions.recentActivity')}
			/>
			<PagerElement
				from={from}
				nextEnabled={nextEnabled}
				paginationUrl={PAGINATION_URL}
				results={currentResults}
				searchResultsCallback={setCurrentResults}
				size={size}
			/>
		</div>
	);
}
