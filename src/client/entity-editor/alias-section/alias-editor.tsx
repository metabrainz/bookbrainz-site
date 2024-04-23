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

import {Button, Col, Form, Modal, Row} from 'react-bootstrap';
import {
	validateAliasLanguage, validateAliasName, validateAliasSortName
} from '../validators/common';
import LanguageField from '../common/language-field';
import NameField from '../common/name-field';
import PropTypes from 'prop-types';
import React from 'react';
import SortNameField from '../common/sort-name-field';
import {connect} from 'react-redux';
import {isAliasEmpty} from '../helpers';


const onClose = (setVisibility, removeEmptyAliases) => {
	  setVisibility(false);
	  removeEmptyAliases();
};

function AliasEditor({
	show,
	setVisibility,
	nameValue,
	sortNameValue,
	aliasLanguage,
	languageOptions,
	languageValue,
	primaryCheck,
	onLanguageChange,
	onNameChange,
	onSortNameChange,
	onPrimaryClick,
	removeEmptyAliases
}) {
	const handleModalCLose = React.useCallback(() => {
		onClose(setVisibility, removeEmptyAliases);
	}, []);
	return (
		<Modal show={show} size="lg" onHide={handleModalCLose}>
			<Modal.Header>
				<Modal.Title>
					Identifier Editor
				</Modal.Title>
			</Modal.Header>

			<Modal.Body>
				<Row>
					<Col lg={3}>
						<NameField
							autoFocus
							defaultValue={nameValue}
							empty={isAliasEmpty(nameValue, sortNameValue, aliasLanguage)}
							error={!validateAliasName(nameValue)}
							onChange={onNameChange}
						/>
					</Col>
					<Col lg={5}>
						<SortNameField
							defaultValue={sortNameValue}
							empty={isAliasEmpty(nameValue, sortNameValue, aliasLanguage)}
							error={!validateAliasSortName(sortNameValue)}
							storedNameValue={nameValue}
							onChange={onSortNameChange}
						/>
					</Col>
					<Col lg={4}>
						<LanguageField
							empty={isAliasEmpty(nameValue, sortNameValue, aliasLanguage)}
							error={!validateAliasLanguage(aliasLanguage)}
							instanceId="language"
							options={languageOptions}
							value={languageValue}
							onChange={onLanguageChange}
						/>
					</Col>
				</Row>
				<Row className="justify-content-center">
					<div className="d-flex align-items-center">
						<Form.Check
							defaultChecked={primaryCheck}
							label="Primary"
							type="checkbox"
							onChange={onPrimaryClick}
						/>
					</div>
				</Row>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="primary" onClick={handleModalCLose}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
}
AliasEditor.displayName = 'AliasEditor';
AliasEditor.propTypes = {
	aliasLanguage: PropTypes.number.isRequired,
	languageOptions: PropTypes.array.isRequired,
	languageValue: PropTypes.array.isRequired,
	nameValue: PropTypes.string.isRequired,
	onLanguageChange: PropTypes.func.isRequired,
	onNameChange: PropTypes.func.isRequired,
	onPrimaryClick: PropTypes.func.isRequired,
	onSortNameChange: PropTypes.func.isRequired,
	primaryCheck: PropTypes.bool.isRequired,
	removeEmptyAliases: PropTypes.func.isRequired,
	setVisibility: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	sortNameValue: PropTypes.string.isRequired
};


export default connect(null, null)(AliasEditor);
