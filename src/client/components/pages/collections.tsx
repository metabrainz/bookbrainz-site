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


import React, {useCallback, useState} from 'react';
import CollectionsTable from './parts/collections-table';
import PagerElement from './parts/pager';
import {useTranslation} from 'react-i18next';


const PAGINATION_URL = './collections/collections';

type Props = {
	editor?: {id: number} | null,
	entityTypes: string[],
	from?: number,
	nextEnabled: boolean,
	results?: unknown[],
	showIfOwnerOrCollaborator?: boolean,
	showLastModified?: boolean,
	showOwner?: boolean,
	showPrivacy?: boolean,
	size?: number,
	tableHeading?: string | null,
	type?: string | null,
	user?: Record<string, unknown> | null
};

export default function CollectionsPage({
	editor = null, entityTypes, from = 0, nextEnabled, results = [], showIfOwnerOrCollaborator = false, showLastModified = false,
	showOwner = false, showPrivacy = false, size = 20, tableHeading = null, type: initialType = '', user = null
}: Props) {
	const {t: translate} = useTranslation();
	const [querySearchParams, setQuerySearchParams] = useState(initialType ? `type=${initialType}` : '');
	const [currentResults, setCurrentResults] = useState(results);
	const [type, setType] = useState(initialType);

	const handleTypeChange = useCallback((newType: string) => {
		setQuerySearchParams(newType ? `type=${newType}` : '');
		setType(newType);
	}, []);

	const searchParamsChangeCallback = useCallback((searchParams: URLSearchParams) => {
		const newType = searchParams.get('type') ?? '';
		if (newType !== type) {
			setQuerySearchParams(`?${searchParams.toString()}`);
			setType(newType);
		}
	}, [type]);

	return (
		<div id="pageWithPagination">
			<CollectionsTable
				entityTypes={entityTypes}
				ownerId={editor ? editor.id : null}
				results={currentResults}
				showIfOwnerOrCollaborator={showIfOwnerOrCollaborator}
				showLastModified={showLastModified}
				showOwner={showOwner}
				showPrivacy={showPrivacy}
				tableHeading={tableHeading ?? translate('common.entityType.collection_plural')}
				type={type}
				user={user}
				onTypeChange={handleTypeChange}
			/>
			<PagerElement
				from={from}
				nextEnabled={nextEnabled}
				paginationUrl={PAGINATION_URL}
				querySearchParams={querySearchParams}
				results={currentResults}
				searchParamsChangeCallback={searchParamsChangeCallback}
				searchResultsCallback={setCurrentResults}
				size={size}
			/>
		</div>
	);
}
