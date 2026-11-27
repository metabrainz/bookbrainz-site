/*
 * Copyright (C) 2026  Ansh Goyal
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

import {Button, ButtonGroup, Col, Dropdown, DropdownButton, Row} from 'react-bootstrap';
import {Link, useSearchParams} from 'react-router';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';


const PAGE_SIZES = [10, 20, 35, 50, 100];

type Props = {
	from: number,
	nextEnabled: boolean,
	// The number of results on this page
	shown: number,
	size: number
};

// Links to the previous and next pages of a list whose page is in the address (?from=&size=)
export default function Pagination({from, nextEnabled, shown, size}: Props) {
	const {t: translate} = useTranslation();
	const [searchParams, setSearchParams] = useSearchParams();

	function pageSearch(newFrom: number) {
		const params = new URLSearchParams(searchParams);
		params.set('from', String(newFrom));
		params.set('size', String(size));
		return `?${params.toString()}`;
	}

	const handleSizeChange = useCallback((newSize: string | null) => {
		if (newSize) {
			setSearchParams((params) => {
				params.set('from', String(from));
				params.set('size', newSize);
				return params;
			});
		}
	}, [from, setSearchParams]);

	if (shown === 0) {
		return null;
	}
	const previous = translate('common.pagination.previous');
	const next = translate('common.pagination.next');
	return (
		<div>
			<hr className="thin"/>
			<Row className="pb-4">
				<Col lg={4}>
					{from <= 0 ?
						<Button disabled className="round-button" variant="outline-primary">{previous}</Button> :
						<Button as={Link} className="round-button" to={pageSearch(Math.max(from - size, 0))} variant="outline-primary">
							{previous}
						</Button>}
				</Col>
				<Col className="text-center" lg={4}>
					<ButtonGroup>
						<Button disabled variant="secondary">
							{translate('common.pagination.results', {from: from + 1, to: from + Math.min(shown, size)})}
						</Button>
						<DropdownButton
							drop="up"
							id="bg-nested-dropdown"
							title={translate('common.pagination.perPage', {count: size})}
							variant="info"
							onSelect={handleSizeChange}
						>
							{PAGE_SIZES.map((pageSize) => (
								<Dropdown.Item eventKey={String(pageSize)} key={pageSize}>
									{translate('common.pagination.perPage', {count: pageSize})}
								</Dropdown.Item>
							))}
						</DropdownButton>
					</ButtonGroup>
				</Col>
				<Col className="text-right" lg={4}>
					{nextEnabled ?
						<Button as={Link} className="round-button" to={pageSearch(from + size)} variant="outline-primary">{next}</Button> :
						<Button disabled className="round-button" variant="outline-primary">{next}</Button>}
				</Col>
			</Row>
		</div>
	);
}
