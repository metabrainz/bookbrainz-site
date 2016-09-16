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


import {Button, Col, Row} from 'react-bootstrap';
import LanguageField from './language-field-container';
import NameField from './name-field-container';
import PrimaryCheck from './primary-check';
import React from 'react';
import RemoveAliasButton from './remove-alias-button';
import SortNameField from './sort-name-field-container';

const AliasRow = ({
	languageOptions,
	index
}) => (
	<div>
		<Row>
			<Col md={4}>
				<NameField index={index}/>
			</Col>
			<Col md={4}>
				<SortNameField index={index}/>
			</Col>
			<Col md={4}>
				<LanguageField index={index} options={languageOptions}/>
			</Col>
		</Row>
		<Row>
			<Col md={2} mdOffset={5}>
				<PrimaryCheck index={index}/>
			</Col>
			<Col className="text-right" md={3} mdOffset={2}>
				<RemoveAliasButton index={index}/>
			</Col>
		</Row>
		<hr/>
	</div>
);
AliasRow.displayName = 'AliasEditor.AliasRow';
AliasRow.propTypes = {
	index: React.PropTypes.number,
	languageOptions: React.PropTypes.array
};

export default AliasRow;
