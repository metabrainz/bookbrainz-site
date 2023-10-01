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
import {Alert, Button, Card, Col, Form, Modal, Row} from 'react-bootstrap';
import {IdentifierTypeDataT, IdentifierTypeEditorPropsT,
	defaultIdentifierTypeData, entityTypeOptions, renderSelectedParentIdentifierType} from './typeUtils';
import React, {ChangeEvent, FormEvent, useCallback, useEffect, useState} from 'react';
import {faPencilAlt, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ReactSelect from 'react-select';
import classNames from 'classnames';
import request from 'superagent';


function IdentifierTypeEditor({identifierTypeData, parentTypes}: IdentifierTypeEditorPropsT) {
	const [formData, setFormData] = useState<IdentifierTypeDataT>(identifierTypeData);

	// State for the ParentType modal
	const [showModal, setShowModal] = useState<boolean>(false);
	const [selectedParentType, setSelectedParentType] = useState<number | null>(identifierTypeData.parentId);
	const [childOrder, setChildOrder] = useState<number>(formData.childOrder);

	const [filteredParentTypes, setFilteredParentTypes] = useState<IdentifierTypeDataT[]>(parentTypes);
	useEffect(() => {
		if (formData.entityType) {
			const filteredTypes = parentTypes.filter(type => type.entityType === formData.entityType);
			setFilteredParentTypes(filteredTypes);
		}
		else {
			setFilteredParentTypes(parentTypes);
		}
	}, [formData.entityType]);

	const [errorMsg, setErrorMsg] = useState<string>('');

	// Callback function for opening the modal
	const handleAddParent = useCallback(() => {
		setShowModal(true);
	}, []);

	// Callback function for closing the modal, the state of the modal should alse be reset
	const handleModalClose = useCallback(() => {
		setSelectedParentType(null);
		setChildOrder(0);
		setShowModal(false);
	}, []);

	// Function to handle parent type selection in ParentType modal
	const handleParentTypeChange = useCallback((selectedOption) => {
		if (selectedOption) {
			setSelectedParentType(selectedOption.id);
		}
		else {
			setSelectedParentType(null);
		}
	}, [selectedParentType]);

	// Function to handle child order input in ParentType modal
	const handleChildOrderChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setChildOrder(event.target.valueAsNumber || 0);
	}, [formData, childOrder]);

	// Function to handle parent removal
	const handleRemoveParent = useCallback(() => {
		setFormData((prevFormData) => ({
			...prevFormData,
			childOrder: 0, parentId: null
		}));
		setChildOrder(0);
		setSelectedParentType(null);
	}, [formData]);

	const handleEditParent = useCallback(() => {
		setShowModal(true);
	}, []);

	// Function to handle parent type and child order edit submission
	const handleModalSubmit = useCallback(() => {
		if (selectedParentType !== null) {
			setFormData((prevFormData) => ({
				...prevFormData,
				childOrder, parentId: selectedParentType
			}));
			setShowModal(false);
		}
	}, [formData, childOrder, selectedParentType]);

	const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		  const {name, value} = event.target;
		  setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value
		  }));
	}, [formData]);

	const handleDeprecatedChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const {value} = event.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			deprecated: value === 'true'
		}));
	}, [formData]);

	const errorAlertClass = classNames('text-center', 'margin-top-1', {'d-none': !errorMsg.length});

	const getEntityTypeLabel = useCallback(option => option.name, []);

	const getEntityTypeValue = useCallback(option => option.name, []);

	const getParentTypeValue = useCallback(option => option.id, []);

	// Callback function to format the option label
	const formatParentTypeOptionLabel = useCallback(option => (
		<div className="small">
			<div>
				<strong>Label:&nbsp;</strong>{option.label}
			</div>
			<div>
				<strong>Description:&nbsp;</strong>{option.description}
			</div>
		</div>
	), []);

	const handleEntityTypeChange = useCallback((selectedOption) => {
		if (selectedOption) {
			setFormData({...formData, entityType: selectedOption.name});
		}
		else {
			setFormData({...formData, entityType: null});
		}
	}, [formData]);

	function isValid() {
		return Boolean(formData.entityType);
	}

	function isFormEdited() {
		return JSON.stringify(formData) !== JSON.stringify(identifierTypeData);
	}

	const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isValid()) {
			setErrorMsg('Error: Incomplete form! Select Entity Type.');
			setTimeout(() => {
				setErrorMsg('');
			  }, 3000);
			return;
		}
		if (!isFormEdited()) {
			setErrorMsg('No updated field!');
			setTimeout(() => {
				setErrorMsg('');
			  }, 3000);
			return;
		}

		let submissionURL;
		if (identifierTypeData.id) {
			submissionURL = `/identifier-type/${identifierTypeData.id}/edit/handler`;
		}
		else {
			submissionURL = '/identifier-type/create/handler';
		}

		try {
			await request.post(submissionURL).send(formData);
			window.location.href = '/identifier-types';
		}
		catch (err) {
			const errorMessage = err.response.body.error;
			setErrorMsg(errorMessage);
			setTimeout(() => {
				setErrorMsg('');
			}, 3000);
		}
	}, [formData, isFormEdited, errorMsg]);

	// When we change EntityType, then we must check the validity of the parentType
	// in case it is already selected
	useEffect(() => {
		if (formData.parentId) {
			const parentType = parentTypes.find(type => type.id === formData.parentId);
			if (formData.entityType && formData.entityType !== parentType?.entityType) {
				handleRemoveParent();
			}
		}
	}, [formData.entityType]);

	const lgCol = {offset: 3, span: 6};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<Card.Header as="h4">
					Add Identifier Type
				</Card.Header>
				<Card.Body>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Label</Form.Label>
								<Form.Control
									required
									name="label"
									type="text"
									value={formData.label}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Description</Form.Label>
								<Form.Control
									required
									name="description"
									type="text"
									value={formData.description}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Detection RegEx</Form.Label>
								<Form.Control
									required
									name="detectionRegex"
									type="text"
									value={formData.detectionRegex}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Validation RegEx</Form.Label>
								<Form.Control
									required
									name="validationRegex"
									type="text"
									value={formData.validationRegex}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Display Template</Form.Label>
								<Form.Control
									required
									name="displayTemplate"
									type="text"
									value={formData.displayTemplate}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Entity Type</Form.Label>
								<ReactSelect
									classNamePrefix="react-select"
									defaultValue={entityTypeOptions.filter((option) => option.name === identifierTypeData.entityType)}
									getOptionLabel={getEntityTypeLabel}
									getOptionValue={getEntityTypeValue}
									instanceId="entityType"
									options={entityTypeOptions}
									placeholder="Select Entity Type"
									onChange={handleEntityTypeChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Parent Identifier Type</Form.Label>
								{!formData.parentId ? (
									<Row className="margin-top-1">
										<Col
											className="text-center"
										>
											<Button
												variant="success"
												onClick={handleAddParent}
											>
												<FontAwesomeIcon icon={faPlus}/>
												<span>&nbsp;Add Parent Identifier Type</span>
											</Button>
										</Col>
									</Row>
								) : (
									<Row className="margin-top-d5">
										<Col className="text-center">
											{formData.parentId &&
											renderSelectedParentIdentifierType(formData.parentId, formData.childOrder, parentTypes)}
											<div className="btn-group d-flex margin-top-1" role="group">
												<Button
													href="#"
													role="button"
													variant="warning"
													onClick={handleEditParent}
												>
													<FontAwesomeIcon icon={faPencilAlt}/>
													<span>&nbsp;Edit</span>
												</Button>
												<Button
													href="#"
													role="button"
													variant="danger"
													onClick={handleRemoveParent}
												>
													<FontAwesomeIcon icon={faTimes}/>
													<span>&nbsp;Remove</span>
												</Button>
											</div>
										</Col>
									</Row>
								)}
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Deprecated</Form.Label>
								<Form.Control
									required
									as="select"
									name="deprecated"
									value={formData.deprecated.toString()}
									onChange={handleDeprecatedChange}
								>
									<option value="false">No</option>
									<option value="true">Yes</option>
								</Form.Control>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							{
								Boolean(errorMsg.length) &&
								<div className={errorAlertClass}>
									<Alert variant="danger">{errorMsg}</Alert>
								</div>
							}
						</Col>
					</Row>
					<Row>
						<Col className="text-center margin-top-d5" lg={lgCol}>
							<Button type="submit">Submit</Button>
						</Col>
					</Row>
					{/* Modal for selecting parent type */}
					<Modal show={showModal} onHide={handleModalClose}>
						<Modal.Header closeButton>
							<Modal.Title>{formData.parentId ? 'Edit Parent' : 'Add a Parent'}</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<Form.Group>
								<Form.Label>Parent Type:</Form.Label>
								<ReactSelect
									classNamePrefix="react-select"
									formatOptionLabel={formatParentTypeOptionLabel}
									getOptionValue={getParentTypeValue}
									instanceId="parentType"
									options={filteredParentTypes}
									value={filteredParentTypes.find((option) => option.id === selectedParentType)}
									onChange={handleParentTypeChange}
								/>
							</Form.Group>
							<Form.Group >
								<Form.Label>Child Order</Form.Label>
								<Form.Control
									required
									min={0}
									name="childOrder"
									type="number"
									value={childOrder}
									onChange={handleChildOrderChange}
								/>
							</Form.Group>
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={handleModalClose}>
								Close
							</Button>
							<Button variant="primary" onClick={handleModalSubmit}>
								{formData.parentId ? 'Save Changes' : 'Add Parent'}
							</Button>
						</Modal.Footer>
					</Modal>
				</Card.Body>
			</Card>
		</form>
	);
}

IdentifierTypeEditor.defaultProps = {
	identifierTypeData: defaultIdentifierTypeData
};

export default IdentifierTypeEditor;
