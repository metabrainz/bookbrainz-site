/*
 * Copyright (C) 2019 Prabal Singh
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

import * as bootstrap from 'react-bootstrap';
import React, {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {getNextEnabledAndResultsArray} from '../../../../common/helpers/utils';
import {noop} from 'lodash';
import request from 'superagent';
import {useTranslation} from 'react-i18next';


const {Button, ButtonGroup, Col, Dropdown, DropdownButton, Row} = bootstrap;

export type PagerHandle = {
	triggerSearch: () => void
};

type Props<Result> = {
	from?: number,
	nextEnabled: boolean,
	paginationUrl: string,
	querySearchParams?: string,
	ref?: React.Ref<PagerHandle>,
	results?: Result[],
	searchParamsChangeCallback?: (searchParams: URLSearchParams) => void,
	searchResultsCallback: (results: Result[]) => void,
	size?: number
};

export default function PagerElement<Result>({
	from: initialFrom = 0,
	nextEnabled: initialNextEnabled,
	paginationUrl,
	querySearchParams = '',
	ref = null,
	results: initialResults = [],
	searchParamsChangeCallback = noop,
	searchResultsCallback,
	size: initialSize = 20
}: Props<Result>) {
	const {t: translate} = useTranslation();
	const [from, setFrom] = useState(initialFrom);
	const [nextEnabled, setNextEnabled] = useState(initialNextEnabled);
	const [results, setResults] = useState(initialResults);
	const [size, setSize] = useState(initialSize);

	const triggerSearch = useCallback((newFrom = from, newSize = size) => {
		const searchParams = new URLSearchParams(querySearchParams);
		searchParams.set('size', String(newSize));
		searchParams.set('from', String(newFrom));
		const newSearchParamsString = `?${searchParams.toString()}`;
		// Don't push a new entry when user navigates with browser prev/next buttons,
		// which already sets the url search params accordingly.
		// Otherwise we rewrite history from this point onwards and prevent from going forward again.
		if (newSearchParamsString !== window.location.search) {
			window.history.pushState(null, '', newSearchParamsString);
		}

		// fetch 1 more result than size to check nextEnabled
		searchParams.set('size', String(newSize + 1));

		request.get(`${paginationUrl}?${searchParams.toString()}`)
			.then((res) => {
				const data: Result[] | {results: Result[]} = JSON.parse(res.text);
				// Some endpoints (for example /search/search) return an object of type {result: array, total: number}
				const fetchedResults = Array.isArray(data) ? data : data.results;
				const {newResultsArray, nextEnabled: newNextEnabled} = getNextEnabledAndResultsArray(fetchedResults, newSize);
				setFrom(newFrom);
				setNextEnabled(newNextEnabled);
				setResults(newResultsArray);
				setSize(newSize);
				searchResultsCallback(newResultsArray);
			});
	}, [from, size, querySearchParams, paginationUrl, searchResultsCallback]);

	useImperativeHandle(ref, () => ({triggerSearch: () => triggerSearch()}), [triggerSearch]);

	// Set initial size and from parameter in browser address bar
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('size', String(size));
		searchParams.set('from', String(from));
		const newSearchParamsString = `?${searchParams.toString()}`;
		if (newSearchParamsString !== window.location.search) {
			window.history.replaceState(null, '', newSearchParamsString);
		}
	}, []);

	function handleURLChange() {
		const searchParams = new URLSearchParams(window.location.search);
		let newFrom: number | undefined;
		let newSize: number | undefined;
		if (searchParams.has('from')) {
			newFrom = Number(searchParams.get('from'));
		}
		if (searchParams.has('size')) {
			newSize = Number(searchParams.get('size'));
		}
		searchParamsChangeCallback(searchParams);
		if (newFrom === from && newSize === size) {
			return;
		}
		triggerSearch(newFrom, newSize);
	}
	// The listener is added once and calls the handler of the latest render
	const handleURLChangeRef = useRef(handleURLChange);
	useEffect(() => {
		handleURLChangeRef.current = handleURLChange;
	});
	useEffect(() => {
		function listener() {
			handleURLChangeRef.current();
		}
		window.addEventListener('popstate', listener);
		return () => window.removeEventListener('popstate', listener);
	}, []);

	// A new query starts again from the first page
	const previousQuerySearchParams = useRef(querySearchParams);
	useEffect(() => {
		if (previousQuerySearchParams.current !== querySearchParams) {
			previousQuerySearchParams.current = querySearchParams;
			setFrom(0);
			triggerSearch(0);
		}
	}, [querySearchParams, triggerSearch]);

	const handleClickPrevious = useCallback(() => {
		triggerSearch(Math.max(from - size, 0));
	}, [from, size, triggerSearch]);

	const handleClickNext = useCallback(() => {
		triggerSearch(from + size);
	}, [from, size, triggerSearch]);

	const handleResultsPerPageChange = useCallback((newSize: string | null) => {
		if (newSize) {
			triggerSearch(from, parseInt(newSize, 10));
		}
	}, [from, triggerSearch]);

	if (!results.length) {
		return null;
	}
	return (
		<div id="PagerElement">
			<hr className="thin"/>
			<Row className="pb-4">
				<Col lg={4}>
					<Button
						className="round-button"
						disabled={from <= 0}
						variant="outline-primary"
						onClick={handleClickPrevious}
					>
						{translate('common.pagination.previous')}
					</Button>
				</Col>
				<Col className="text-center" lg={4}>
					<ButtonGroup>
						<Button disabled variant="secondary">
							{translate('common.pagination.results', {
								from: from + 1,
								to: results.length < size ? from + results.length : from + size
							})}
						</Button>
						<DropdownButton
							drop="up" id="bg-nested-dropdown" title={translate('common.pagination.perPage', {count: size})}
							variant="info"
							onSelect={handleResultsPerPageChange}
						>
							<Dropdown.Item eventKey="10">{translate('common.pagination.perPage', {count: 10})}</Dropdown.Item>
							<Dropdown.Item eventKey="20">{translate('common.pagination.perPage', {count: 20})}</Dropdown.Item>
							<Dropdown.Item eventKey="35">{translate('common.pagination.perPage', {count: 35})}</Dropdown.Item>
							<Dropdown.Item eventKey="50">{translate('common.pagination.perPage', {count: 50})}</Dropdown.Item>
							<Dropdown.Item eventKey="100">{translate('common.pagination.perPage', {count: 100})}</Dropdown.Item>
						</DropdownButton>
					</ButtonGroup>
				</Col>
				<Col className="text-right" lg={4}>
					<Button
						className="round-button"
						disabled={!nextEnabled}
						variant="outline-primary"
						onClick={handleClickNext}
					>
						{translate('common.pagination.next')}
					</Button>
				</Col>
			</Row>
		</div>
	);
}
