// TODO: type this file properly and remove the ts-nocheck.
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
import React, {ChangeEvent, FormEvent, useCallback, useState} from 'react';
import {RelationshipTypeEditorPropsT, RelationshipTypeFieldsT,
	defaultRelationshipTypeFields, entityTypeOptions, renderSelectedParentRelationshipType} from './typeUtils';
import {faPencilAlt, faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ReactSelect from 'react-select';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import request from 'superagent';


function RelationshipTypeEditor({
	relationshipTypeData,
	parentTypes,
	attributeTypes
}: RelationshipTypeEditorPropsT) {
	const initialFields: RelationshipTypeFieldsT = relationshipTypeData ?? defaultRelationshipTypeFields;
	const initialSourceEntityType = relationshipTypeData?.sourceEntityType ?? null;
	const initialTargetEntityType = relationshipTypeData?.targetEntityType ?? null;
	const [formData, setFormData] = useState(initialFields);
	// null until the user picks them (always for a new type)
	const [sourceEntityType, setSourceEntityType] = useState(initialSourceEntityType);
	const [targetEntityType, setTargetEntityType] = useState(initialTargetEntityType);

	// State for the ParentType modal
	const [showModal, setShowModal] = useState<boolean>(false);
	const [selectedParentType, setSelectedParentType] = useState<number | null>(initialFields.parentId);

	// The parent of a type relates the same entity types
	const filteredParentTypes = parentTypes.filter((type) =>
		(!sourceEntityType || type.sourceEntityType === sourceEntityType) &&
		(!targetEntityType || type.targetEntityType === targetEntityType));

	const isFormEdited = sourceEntityType !== initialSourceEntityType || targetEntityType !== initialTargetEntityType ||
		!isEqual(formData, initialFields);

	// This flag is used to check if any field has been updated while editing a type
	const [noChangesError, setNoChangesError] = useState<boolean>(false);

	// This flag is used to check whether we have selected source and target entity types
	const [showIncompleteFormError, setShowIncompleteFormError] = useState<boolean>(false);

	const handleAttributeTypesChange = useCallback(
		(selectedOptions) => {
			const selectedHouseTypeIds = selectedOptions.map((option) => option.id);
			setFormData((prevFormData) => ({
				...prevFormData,
				attributeTypes: selectedHouseTypeIds
			}));
		},
		[formData.attributeTypes]
	);

	// Callback function for opening the modal
	const handleAddParent = useCallback(() => {
		setShowModal(true);
	}, []);

	// Callback function for closing the modal, the state of the modal should alse be reset
	const handleModalClose = useCallback(() => {
		setSelectedParentType(null);
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

	// Function to handle parent removal
	const handleRemoveParent = useCallback(() => {
		setFormData((prevFormData) => ({
			...prevFormData,
			childOrder: 0, parentId: null
		}));
		setSelectedParentType(null);
	}, []);

	const handleEditParent = useCallback(() => {
		setShowModal(true);
	}, []);

	// Function to handle parent type and child order edit submission
	const handleModalSubmit = useCallback(() => {
		if (selectedParentType !== null) {
			setFormData((prevFormData) => ({
				...prevFormData,
				parentId: selectedParentType
			}));
			setShowModal(false);
		}
	}, [formData, selectedParentType]);

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

	const getEntityTypeLabel = useCallback(option => option.name, []);

	const getEntityTypeValue = useCallback(option => option.name, []);

	const getParentTypeValue = useCallback(option => option.id, []);

	const getAttributeTypeOptionValue = useCallback(option => option.id, []);
	const getAttributeTypeOptionLabel = useCallback(option => option.name, []);

	// Callback function to format the option label to include both forwardStatement and reverseStatement
	const formatParentTypeOptionLabel = useCallback(option => (
		<div className="small">
			<div>{option.sourceEntityType}&nbsp;{option.linkPhrase}&nbsp;{option.targetEntityType}</div>
			<div>{option.targetEntityType}&nbsp;{option.reverseLinkPhrase}&nbsp;{option.sourceEntityType}</div>
		</div>
	), []);

	const formatAttributeTypeOptionLabel = useCallback(option => <div>{option.name}</div>, []);

	// The parent of a type relates the same entity types
	const removeParentOfOtherEntityTypes = useCallback((source, target) => {
		const parentType = parentTypes.find(type => type.id === formData.parentId);
		if (formData.parentId && ((source && source !== parentType?.sourceEntityType) ||
			(target && target !== parentType?.targetEntityType))) {
			handleRemoveParent();
		}
	}, [formData.parentId, handleRemoveParent, parentTypes]);

	const handleSourceEntityTypeChange = useCallback((selectedOption) => {
		const newSourceEntityType = selectedOption ? selectedOption.name : null;
		setSourceEntityType(newSourceEntityType);
		removeParentOfOtherEntityTypes(newSourceEntityType, targetEntityType);
		if (selectedOption && targetEntityType) {
			setShowIncompleteFormError(false);
		}
	}, [removeParentOfOtherEntityTypes, targetEntityType]);

	const handleTargetEntityTypeChange = useCallback((selectedOption) => {
		const newTargetEntityType = selectedOption ? selectedOption.name : null;
		setTargetEntityType(newTargetEntityType);
		removeParentOfOtherEntityTypes(sourceEntityType, newTargetEntityType);
		if (selectedOption && sourceEntityType) {
			setShowIncompleteFormError(false);
		}
	}, [removeParentOfOtherEntityTypes, sourceEntityType]);

	const errorAlertClass = classNames('text-center', 'margin-top-1', {'d-none': !showIncompleteFormError});

	function isValid() {
		return Boolean(sourceEntityType && targetEntityType);
	}

	const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isValid()) {
			setShowIncompleteFormError(true);
			return;
		}
		if (!isFormEdited) {
			// Display an error message if no changes were made
			setNoChangesError(true);
			// Hide the error message after 3 seconds
			setTimeout(() => {
			  setNoChangesError(false);
			}, 3000);
			return;
		}

		let submissionURL;
		if (relationshipTypeData) {
			submissionURL = `/relationship-type/${relationshipTypeData.id}/edit/handler`;
		}
		else {
			submissionURL = '/relationship-type/create/handler';
		}

		try {
			await request.post(submissionURL)
				.send({oldAttributeTypes: initialFields.attributeTypes, ...formData, sourceEntityType, targetEntityType});
			window.location.href = document.referrer;
		}
		catch (err) {
			throw new Error(err);
		}
	}, [formData, isFormEdited, showIncompleteFormError, sourceEntityType, targetEntityType]);

	const lgCol = {offset: 3, span: 6};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<Card.Header as="h4">
					Add Relationship Type
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
									as="textarea"
									name="description"
									rows={3}
									value={formData.description}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Link Phrase</Form.Label>
								<Form.Control
									required
									name="linkPhrase"
									type="text"
									value={formData.linkPhrase}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Reverse Link Phrase</Form.Label>
								<Form.Control
									required
									name="reverseLinkPhrase"
									type="text"
									value={formData.reverseLinkPhrase}
									onChange={handleInputChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Source Entity Type</Form.Label>
								<ReactSelect
									classNamePrefix="react-select"
									defaultValue={entityTypeOptions.filter((option) => option.name === initialSourceEntityType)}
									getOptionLabel={getEntityTypeLabel}
									getOptionValue={getEntityTypeValue}
									instanceId="sourceEntityType"
									options={entityTypeOptions}
									placeholder="Select Source Entity Type"
									onChange={handleSourceEntityTypeChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Target Entity Type</Form.Label>
								<ReactSelect
									classNamePrefix="react-select"
									defaultValue={entityTypeOptions.filter((option) => option.name === initialTargetEntityType)}
									getOptionLabel={getEntityTypeLabel}
									getOptionValue={getEntityTypeValue}
									instanceId="targetEntityType"
									options={entityTypeOptions}
									placeholder="Select Target Entity Type"
									onChange={handleTargetEntityTypeChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							<Form.Group>
								<Form.Label>Parent Relationship</Form.Label>
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
												<span>&nbsp;Add Parent Relationship</span>
											</Button>
										</Col>
									</Row>
								) : (
									<Row className="margin-top-d5">
										<Col className="text-center">
											{formData.parentId &&
											renderSelectedParentRelationshipType(formData.parentId, formData.childOrder, parentTypes)}
											<div className="btn-group d-flex margin-top-1" role="group">
												<Button
													className="w-100"
													href="#"
													role="button"
													variant="warning"
													onClick={handleEditParent}
												>
													<FontAwesomeIcon icon={faPencilAlt}/>
													<span>&nbsp;Edit</span>
												</Button>
												<Button
													className="w-100"
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
							<Form.Group >
								<Form.Label>Child Order</Form.Label>
								<Form.Control
									required
									defaultValue={0}
									min={0}
									name="childOrder"
									type="number"
									value={formData.childOrder}
									onChange={handleInputChange}
								/>
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
							<Form.Group>
								<Form.Label>Attribute Types</Form.Label>
								<ReactSelect
									closeMenuOnSelect
									isMulti
									formatOptionLabel={formatAttributeTypeOptionLabel}
									getOptionLabel={getAttributeTypeOptionLabel}
									getOptionValue={getAttributeTypeOptionValue}
									options={attributeTypes}
									value={attributeTypes.filter((attributeType) => formData.attributeTypes.includes(attributeType.id))}
									onChange={handleAttributeTypesChange}
								/>
							</Form.Group>
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							{
								showIncompleteFormError &&
								<div className={errorAlertClass}>
									<Alert variant="danger">Error: Incomplete form! Select Source and Target Parent Types.</Alert>
								</div>
							}
						</Col>
					</Row>
					<Row>
						<Col lg={lgCol}>
							{
								noChangesError &&
								<Alert variant="danger">Error: No updated field.</Alert>
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

export default RelationshipTypeEditor;
