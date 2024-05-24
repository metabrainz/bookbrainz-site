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
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';
import ValueField from './value-field';
import {connect} from 'react-redux';
import {removeEmptyIdentifiers} from './actions';
import {validateIdentifierValue} from '../validators/common';


const onClose = (setVisibility, onRemoveEmptyIdentifiers) => {
	  setVisibility(false);
	  onRemoveEmptyIdentifiers();
};

const identifierSection = ({
	index,
	identifierTypesForDisplay,
	identifierValue,
	onRemoveEmptyIdentifiers,
	onTypeChange,
	onValueChange,
	typeOptions,
	valueValue,
	typeValue,
	show,
	setVisibility
}) => {
	const handleModalCLose = React.useCallback(() => {
		onClose(setVisibility, onRemoveEmptyIdentifiers);
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
					<Col lg={6}>
						<ValueField
							defaultValue={valueValue}
							empty={!valueValue && typeValue === null}
							error={typeValue && !validateIdentifierValue(
								valueValue, typeValue, typeOptions
							)}
							onChange={onValueChange}
						/>
					</Col>
					<Col lg={6}>
						<Form.Group>
							<Form.Label>Type</Form.Label>
							<Select
								classNamePrefix="react-select"
								instanceId={`identifierType${index}`}
								options={identifierTypesForDisplay}
								value={identifierValue}
								onChange={onTypeChange}
							/>
						</Form.Group>
					</Col>
				</Row>
			</Modal.Body>

			<Modal.Footer>
				<Button variant="primary" onClick={handleModalCLose}>Close</Button>
			</Modal.Footer>
		</Modal>
	);
};
identifierSection.displayName = 'identifierSection';
identifierSection.propTypes = {
	identifierTypes: PropTypes.array.isRequired,
	show: PropTypes.bool
};
identifierSection.defaultProps = {
	show: false
};

function mapDispatchToProps(dispatch) {
	return {
		onRemoveEmptyIdentifiers: () => {
			dispatch(removeEmptyIdentifiers());
		}
	};
}

export default connect(null, mapDispatchToProps)(identifierSection);
