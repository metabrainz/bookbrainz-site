/*
 * Copyright (C) 2023 Shivam Awasthi
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

import {Button, Col, Form, InputGroup, Row} from 'react-bootstrap';
import React, {useCallback, useRef} from 'react';
import {Form as RouterForm, useSearchParams, useSubmit} from 'react-router';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {useDebouncedCallback} from '../../../hooks/use-debounced-callback';
import {useEditableValue} from '../../../hooks/use-editable-value';


// How long the field waits after typing before it searches
const SEARCH_DELAY = 1000;

// A search form for /admin-panel: pressing enter searches at once, typing searches after a pause
export default function AdminPanelSearchField({query}: {query: string}) {
	const [searchParams] = useSearchParams();
	const submit = useSubmit();
	const formRef = useRef<HTMLFormElement>(null);
	// The text follows the address when it changes, for example on back and forward
	const [text, setText] = useEditableValue(query);
	const size = searchParams.get('size');

	const searchLater = useDebouncedCallback(() => {
		if (formRef.current) {
			submit(formRef.current);
		}
	}, SEARCH_DELAY);

	// Pressing enter searches at once, so a pending search is dropped
	const handleSubmit = useCallback(() => {
		searchLater.cancel();
	}, [searchLater]);

	const handleTextChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const {value} = event.target;
		if (!value.match(/^ +$/) && value !== text) {
			setText(value);
			searchLater();
		}
	}, [searchLater, setText, text]);

	return (
		<Row>
			<Col lg={{offset: 3, span: 6}}>
				<RouterForm
					action="/admin-panel"
					className="form-horizontal whole-page-form"
					method="get"
					ref={formRef}
					role="search"
					onSubmit={handleSubmit}
				>
					<Form.Group>
						<InputGroup>
							<Form.Control
								aria-label="Search"
								name="q"
								type="text"
								value={text}
								onChange={handleTextChange}
							/>
							<InputGroup.Append>
								<Button
									block
									type="submit"
									variant="success"
								>
									<FontAwesomeIcon icon={faSearch}/>&nbsp;Search
								</Button>
							</InputGroup.Append>
						</InputGroup>
					</Form.Group>
					{size && <input name="size" type="hidden" value={size}/>}
				</RouterForm>
			</Col>
		</Row>
	);
}
