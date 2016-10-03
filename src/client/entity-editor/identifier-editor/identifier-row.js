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
import ValueField from './value-field';
import TypeField from './type-field';
import RemoveIdentifierButton from './remove-identifier-button';

function IdentifierRow({
	typeOptions,
	index
}) {
	const identifierTypesForDisplay = typeOptions.map((type) => ({
		value: type.id,
		label: type.label
	}));

	return (
		<div>
			<Row>
				<Col md={4}>
					<ValueField index={index} types={typeOptions}/>
				</Col>
				<Col md={4}>
					<TypeField index={index} options={identifierTypesForDisplay}/>
				</Col>
				<Col className="text-right" md={3} mdOffset={1}>
					<RemoveIdentifierButton index={index}/>
				</Col>
			</Row>
			<hr/>
		</div>
	);
}
IdentifierRow.displayName = 'IdentifierEditor.Identifier';
IdentifierRow.propTypes = {
	index: React.PropTypes.number,
	typeOptions: React.PropTypes.array
};

export default IdentifierRow;
