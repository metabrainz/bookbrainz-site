/*
 * Copyright (C) 2016  Ben Ockmore
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

import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import {
	validateAliasLanguage, validateAliasName, validateAliasSortName
} from '../validators/common';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import PropTypes from 'prop-types';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import {addNewAlias} from './actions';
import {connect} from 'react-redux';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {isAliasEmpty} from '../helpers';


type LanguageObj = {
    frequency: number,
    label: string,
    value: number
};

function AliasFields({
	languageOptions,
	onAddNewAlias
}) {
	const [nameValue, setNameValue] = React.useState<string>('');
	const [sortNameValue, setSortNameValue] = React.useState<string>('');
	const [languageValue, setLanguageValue] = React.useState<LanguageObj>(null);
	const [primaryCheck, setPrimaryCheckbox] = React.useState<boolean>(false);

	const handleNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setNameValue(event.target.value);
	}, []);
	const handleSortNameChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setSortNameValue(event.target.value);
	}, []);
	const handlePrimaryCheckboxChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setPrimaryCheckbox(event.target.checked);
	}, []);

	const handleAddAliasButtonClick = React.useCallback(() => {
		  onAddNewAlias(nameValue, sortNameValue, languageValue?.value, primaryCheck);
	}, [nameValue, sortNameValue, languageValue?.value, primaryCheck]);

	return (
		<Container>
			<Row className="justify-content-center mt-3">
				<Col lg={{offset: 1, span: 2}}>
					<NameField
						autoFocus
						defaultValue={nameValue}
						empty={isAliasEmpty(nameValue, sortNameValue, languageValue?.value)}
						error={!validateAliasName(nameValue)}
						onChange={handleNameChange}
					/>
				</Col>
				<Col lg={3}>
					<SortNameField
						defaultValue={sortNameValue}
						empty={isAliasEmpty(nameValue, sortNameValue, languageValue?.value)}
						error={!validateAliasSortName(sortNameValue)}
						storedNameValue={nameValue}
						onChange={handleSortNameChange}
					/>
				</Col>
				<Col lg={3}>
					<LanguageField
						empty={isAliasEmpty(nameValue, sortNameValue, languageValue?.value)}
						error={!validateAliasLanguage(languageValue?.value)}
						instanceId="language"
						options={languageOptions}
						value={languageOptions.filter((el) => el.value === languageValue).label}
						onChange={setLanguageValue}
					/>
				</Col>
				<Col lg={2}>
					<div className="mt-4 d-flex flex-column justify-content-between">
						<div>
							<Form.Check
								className="font-weight-bold"
								defaultChecked={primaryCheck}
								label="Primary"
								style={{zoom: 0.8}}
								type="checkbox"
								onChange={handlePrimaryCheckboxChange}
							/>
						</div>
						<div>
							<Button
								size="sm"
								variant="success"
								onClick={handleAddAliasButtonClick}
							>
								<FontAwesomeIcon icon={faPlus}/>
								<span>&nbsp;Add</span>
							</Button>
						</div>
					</div>
				</Col>
			</Row>
		</Container>
	);
}
AliasFields.displayName = 'AliasEditor.AliasRow';
AliasFields.propTypes = {
	languageOptions: PropTypes.array.isRequired,
	onAddNewAlias: PropTypes.func.isRequired
};

function mapDispatchToProps(dispatch) {
	return {
		onAddNewAlias: (nameValue, sortNameValue, languageValue, primary) =>
			dispatch(addNewAlias(nameValue, sortNameValue, languageValue, primary))
	};
}

export default connect(null, mapDispatchToProps)(AliasFields);
