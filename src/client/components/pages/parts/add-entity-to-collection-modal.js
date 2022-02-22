/*
 * Copyright (C) 2020 Prabal Singh
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
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {lowerCase, uniqBy} from 'lodash';
import EntitySearchFieldOption from '../../../entity-editor/common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';


const {Alert, Badge, Button, ButtonGroup, Col, Modal, Row} = bootstrap;

class AddEntityToCollectionModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			entities: [],
			error: null
		};

		this.handleAddEntity = this.handleAddEntity.bind(this);
		this.handleRemoveEntity = this.handleRemoveEntity.bind(this);
		this.handleChangeEntity = this.handleChangeEntity.bind(this);
		this.getCleanedEntities = this.getCleanedEntities.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
	}

	getCleanedEntities() {
		return uniqBy(this.state.entities.filter(entity => entity && entity.id !== null), 'id');
	}

	handleAddEntity() {
		this.setState(prevState => ({
			entities: [...prevState.entities, {id: null, name: ''}]
		}));
	}

	handleChangeEntity(newEnt, index) {
		let newEntity;
		if (!newEnt) {
			newEntity = {
				id: null,
				name: ''
			};
		}
		else {
			newEntity = newEnt;
		}

		this.setState((prevState) => {
			const newEntities = prevState.entities;
			newEntities[index] = newEntity;
			return {
				entities: newEntities
			};
		});
	}

	handleRemoveEntity(index) {
		this.setState(prevState => ({
			entities: prevState.entities.splice(index, 1) && prevState.entities
		}));
	}

	handleAlertDismiss() {
		this.setState({error: null});
	}

	handleSubmit() {
		const cleanedEntities = this.getCleanedEntities();
		const bbids = cleanedEntities.map(entity => entity.id);
		if (bbids.length) {
			request.post(`/collection/${this.props.collectionId}/add`)
				.send({bbids})
				.then(() => {
					this.setState({
						entities: [],
						error: null
					}, () => {
						this.props.closeModalAndShowMessage({
							text: `Added ${bbids.length} ${lowerCase(this.props.collectionType)}${bbids.length > 1 ? 's' : ''}`,
							type: 'success'
						});
					});
				}, () => {
					this.setState({
						error: 'Something went wrong! Please try again later'
					});
				});
		}
		else {
			this.setState({
				error: `No ${lowerCase(this.props.collectionType)} selected`
			});
		}
	}

	render() {
		if (this.state.entities.length === 0) {
			this.handleAddEntity();
		}

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				(
					<div className="text-center margin-top-1">
						<Alert variant="danger" onDismiss={this.handleAlertDismiss}>{this.state.error}</Alert>
					</div>
				);
		}
		const cleanedEntities = this.getCleanedEntities();

		/* eslint-disable react/jsx-no-bind */
		const addEntityToCollectionForm = (
			<Row>
				<Col
					id="addEntityToCollection"
					lg={12}
				>
					<form
						className="padding-sides-0"
					>
						{
							this.state.entities.map((entity, index) => {
								const buttonAfter = (
									<Button
										size="sm"
										type="button"
										variant="danger"
										onClick={() => this.handleRemoveEntity(index)}
									>
										<FontAwesomeIcon icon={faTimes}/>&nbsp;Remove
									</Button>
								);
								return (
									<div key={entity.id}>
										<EntitySearchFieldOption
											buttonAfter={buttonAfter}
											instanceId="entitySearchField"
											label={`Select ${this.props.collectionType}`}
											name={this.props.collectionType}
											type={this.props.collectionType}
											value={entity}
											onChange={(newEntity) => this.handleChangeEntity(newEntity, index)}
										/>
									</div>
								);
							})
						}
					</form>
				</Col>
			</Row>
		);

		return (
			<Modal
				show={this.props.show}
				size="lg"
				onHide={this.props.onCloseModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						Add {lowerCase(this.props.collectionType)}s to the collection
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{addEntityToCollectionForm}
					{errorComponent}
				</Modal.Body>
				<Modal.Footer>
					<ButtonGroup>
						<Button
							type="button"
							variant="primary"
							onClick={this.handleAddEntity}
						>
							<FontAwesomeIcon icon={faPlus}/>
							&nbsp;Add another {lowerCase(this.props.collectionType)}
						</Button>
						<Button
							disabled={!cleanedEntities.length}
							variant="success"
							onClick={this.handleSubmit}
						>
							<FontAwesomeIcon icon={faPlus}/>
							&nbsp;Add <Badge pill>{cleanedEntities.length}</Badge>&nbsp;
							{lowerCase(this.props.collectionType)}{cleanedEntities.length > 1 ? 's' : ''} to the collection
						</Button>
					</ButtonGroup>
				</Modal.Footer>
			</Modal>
		);
	}
}

AddEntityToCollectionModal.displayName = 'AddEntityToCollectionModal';
AddEntityToCollectionModal.propTypes = {
	closeModalAndShowMessage: PropTypes.func.isRequired,
	collectionId: PropTypes.string.isRequired,
	collectionType: PropTypes.string.isRequired,
	onCloseModal: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired
};
export default AddEntityToCollectionModal;

