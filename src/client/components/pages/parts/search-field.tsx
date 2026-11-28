/*
 * Copyright (C) 2015  Ohm Patel
 *               2016  Sean Burke
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
import {type EntityIconType, genEntityIconHTMLElement} from '../../../helpers/entity-icon';
import React, {useCallback, useRef} from 'react';
import {Form as RouterForm, useSearchParams, useSubmit} from 'react-router';
import {camelCase, snakeCase} from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {useDebouncedCallback} from '../../../hooks/use-debounced-callback';
import {useEditableValue} from '../../../hooks/use-editable-value';
import {useTranslation} from 'react-i18next';


const {Button, Col, Dropdown, DropdownButton, InputGroup, Form, Row} = bootstrap;

// How long the field waits after typing or choosing a type before it searches
const SEARCH_DELAY = 2000;

type Props = {
	entityTypes: EntityIconType[],
	query: string,
	type?: string
};

// A search form for /search: pressing enter searches at once, typing or choosing a type searches after a pause
export default function SearchField({entityTypes, query, type = ''}: Props) {
	const {t: translate} = useTranslation();
	const [searchParams] = useSearchParams();
	const submit = useSubmit();
	const formRef = useRef<HTMLFormElement>(null);
	// The text and the type follow the address when it changes, for example on back and forward
	const [text, setText] = useEditableValue(query);
	const [selectedType, setSelectedType] = useEditableValue(type);
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

	const handleTypeSelect = useCallback((eventKey: string | null) => {
		setSelectedType(eventKey ?? '');
		searchLater();
	}, [searchLater, setSelectedType]);

	let dropdownTitle;
	if (!selectedType || selectedType === 'all_entities') {
		dropdownTitle = translate('common.allEntities');
	}
	else if (selectedType === 'editor' || selectedType === 'collection') {
		dropdownTitle = translate(`common.entityType.${selectedType}`);
	}
	else {
		dropdownTitle = translate(`common.entityType.${camelCase(selectedType)}`);
	}

	return (
		<Row>
			<Col lg={{offset: 3, span: 6}}>
				<RouterForm
					action="/search"
					className="form-horizontal whole-page-form"
					method="get"
					ref={formRef}
					role="search"
					onSubmit={handleSubmit}
				>
					<Form.Group>
						<InputGroup>
							<Form.Control
								aria-label={translate('common.button.search')}
								name="q"
								type="text"
								value={text}
								onChange={handleTextChange}
							/>
							<InputGroup.Append>
								<DropdownButton
									as={InputGroup.Append}
									id="entity-type-select"
									title={dropdownTitle}
									variant="secondary"
									onSelect={handleTypeSelect}
								>
									{entityTypes.map((entityType) => (
										<Dropdown.Item
											eventKey={entityType}
											key={entityType}
										>
											{genEntityIconHTMLElement(entityType)}
											{translate(`common.entityType.${camelCase(entityType)}`)}
										</Dropdown.Item>
									))}
									<Dropdown.Divider/>
									<Dropdown.Item
										eventKey="all_entities"
										key="allEntities"
									>
										{translate('common.allEntities')}
									</Dropdown.Item>

									<Dropdown.Divider/>
									<Dropdown.Item
										eventKey="editor"
										key="editor"
									>
										{genEntityIconHTMLElement('Editor')}
										{translate('common.entityType.editor')}
									</Dropdown.Item>
									<Dropdown.Item
										eventKey="collection"
										key="collection"
									>
										{genEntityIconHTMLElement('Collection')}
										{translate('common.entityType.collection')}
									</Dropdown.Item>
								</DropdownButton>
								<Button
									block
									type="submit"
									variant="success"
								>
									<FontAwesomeIcon icon={faSearch}/>&nbsp;{translate('common.button.search')}
								</Button>
							</InputGroup.Append>
						</InputGroup>
					</Form.Group>
					{selectedType && <input name="type" type="hidden" value={snakeCase(selectedType)}/>}
					{size && <input name="size" type="hidden" value={size}/>}
				</RouterForm>
			</Col>
		</Row>
	);
}
