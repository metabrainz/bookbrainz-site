import * as bootstrap from 'react-bootstrap';
import {kebabCase as _kebabCase, lowerCase, uniqBy, upperFirst} from 'lodash';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import EntitySearchFieldOption from '../../../entity-editor/common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';


const {Alert, Badge, Button, ButtonGroup, Col, Modal, Row} = bootstrap;

class AddEntityRelationModal extends React.Component {
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
			const postBody = {relationships: {
			}};
			this.props.entity.relationshipSet?.relationships.forEach((relationship) => {
				postBody.relationships[`n${relationship.id}`] = {
					attributeSetId: relationship.attributeSetId,
					attributes: relationship.attributeSet ? relationship.attributeSet.relationshipAttributes : [],
					relationshipType: relationship.type,
					rowID: `n${relationship.id}`,
					sourceEntity: {bbid: relationship.sourceBbid},
					targetEntity: {bbid: relationship.targetBbid}
				};
			});
			bbids.forEach(
				(bbid, index) => {
					postBody.relationships[`n${index}`] = {
						attributes: [],
						relationshipType: {
							id: this.props.relationshipTypeId
						},
						rowID: `n${index}`,
						sourceEntity: {
							bbid: this.props.isSource ? this.props.entity.bbid : bbid
						},
						targetEntity: {
							bbid: !this.props.isSource ? this.props.entity.bbid : bbid
						}
					};
				}
			);
			request.post(this.props.submitUrl)
				.send(postBody)
				.then(() => {
					this.setState({
						entities: [],
						error: null
					}, () => {
						this.props.closeModalAndShowMessage({
							text: `Added ${bbids.length} ${upperFirst(this.props.targetEntityType)}${bbids.length > 1 ? 's' : ''}`,
							type: 'success'
						});
						window.location.reload();
					});
				}, (err) => {
					this.setState({
						error: `Something went wrong! ${err.response.body?.error ?? 'Please try again later'}`
					});
				});
		}
		else {
			this.setState({
				error: `No ${this.props.targetEntityType} selected`
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
						<Alert dismissible variant="danger" onClose={this.handleAlertDismiss}>{this.state.error}</Alert>
					</div>
				);
		}
		const cleanedEntities = this.getCleanedEntities();

		/* eslint-disable react/jsx-no-bind */
		const addEntityToCollectionForm = (
			<Row>
				<Col
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
											label={`Select ${this.props.targetEntityType}`}
											name={this.props.targetEntityType}
											type={this.props.targetEntityType}
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
						Add {upperFirst(this.props.targetEntityType)}s
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{addEntityToCollectionForm}
					{errorComponent}
				</Modal.Body>
				<Modal.Footer>
					<ButtonGroup>
						<Button
							href={`/${lowerCase(this.props.targetEntityType)}/create?${_kebabCase(this.props.entity.type)}=${
								this.props.entity.bbid
							}`}
							variant="success"
						>
							<FontAwesomeIcon icon={faPlus}/>
							{`  Create ${lowerCase(this.props.targetEntityType)}`}
						</Button>
						<Button
							type="button"
							variant="primary"
							onClick={this.handleAddEntity}
						>
							<FontAwesomeIcon icon={faPlus}/>
							&nbsp;Add another {lowerCase(this.props.targetEntityType)}
						</Button>
						<Button
							disabled={!cleanedEntities.length}
							variant="success"
							onClick={this.handleSubmit}
						>
							<FontAwesomeIcon icon={faPlus}/>
							&nbsp;Link <Badge pill>{cleanedEntities.length}</Badge>&nbsp;
							{lowerCase(this.props.targetEntityType)}{cleanedEntities.length > 1 ? 's' : ''}
						</Button>
					</ButtonGroup>
				</Modal.Footer>
			</Modal>
		);
	}
}

AddEntityRelationModal.displayName = 'AddEntityRelationModal';
AddEntityRelationModal.propTypes = {
	closeModalAndShowMessage: PropTypes.func.isRequired,
	entity: PropTypes.object.isRequired,
	isSource: PropTypes.bool.isRequired,
	onCloseModal: PropTypes.func.isRequired,
	relationshipTypeId: PropTypes.number.isRequired,
	show: PropTypes.bool.isRequired,
	submitUrl: PropTypes.string.isRequired,
	targetEntityType: PropTypes.string.isRequired
};
export default AddEntityRelationModal;
