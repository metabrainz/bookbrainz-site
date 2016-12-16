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


import {Button, Col, Input, Row} from 'react-bootstrap';
import React from 'react';
import Select from 'react-select';
import ValueField from './value-field';


function IdentifierRow({
	typeOptions,
	index,
	valueValue,
	typeValue,
	onTypeChange,
	onRemoveButtonClick,
	onValueChange
}) {
	const identifierTypesForDisplay = typeOptions.map((type) => ({
		value: type.id,
		label: type.label
	}));

	return (
		<div>
			<Row>
				<Col md={4}>
					<ValueField
						index={index}
						typeValue={typeValue}
						types={typeOptions}
						valueValue={valueValue}
						onChange={onValueChange}
					/>
				</Col>
				<Col md={4}>
					<Input label="Type">
						<Select
							index={index}
							options={identifierTypesForDisplay}
							value={typeValue}
							onChange={onTypeChange}
						/>
					</Input>
				</Col>
				<Col className="text-right" md={3} mdOffset={1}>
					<Button
						block
						bsStyle="danger"
						className="margin-top-d15"
						onClick={onRemoveButtonClick}
					>
						Remove
					</Button>
				</Col>
			</Row>
			<hr/>
		</div>
	);
}
IdentifierRow.displayName = 'IdentifierEditor.Identifier';
IdentifierRow.propTypes = {
	index: React.PropTypes.number,
	typeOptions: React.PropTypes.array,
	typeValue: React.PropTypes.number,
	valueValue: React.PropTypes.string,
	onRemoveButtonClick: React.PropTypes.func,
	onTypeChange: React.PropTypes.func,
	onValueChange: React.PropTypes.func
};

export default IdentifierRow;
