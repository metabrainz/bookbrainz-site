import * as bootstrap from 'react-bootstrap';
import CustomInput from '../../../input';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import SelectWrapper from '../../input/select-wrapper';
import request from 'superagent';


const {Alert, Col, Button, Modal} = bootstrap;

class AddToCollectionModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			collectionsAvailable: [],
			message: {
				text: null,
				type: null
			},
			selectedCollections: [],
			show: this.props.show,
			showCollectionForm: false
		};

		this.handleClose = this.handleClose.bind(this);
		this.getCollections = this.getCollections.bind(this);
		this.handleAddToCollection = this.handleAddToCollection.bind(this);
		this.toggleRow = this.toggleRow.bind(this);
		this.handleShowCollectionForm = this.handleShowCollectionForm.bind(this);
		this.handleShowAllCollections = this.handleShowAllCollections.bind(this);
		this.handleAddToNewCollection = this.handleAddToNewCollection.bind(this);
		this.isValid = this.isValid.bind(this);
	}

	async componentDidUpdate(prevProps) {
		const collections = await this.getCollections();
		if (prevProps.show !== this.props.show) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({collectionsAvailable: collections, show: this.props.show});
		}
	}

	toggleRow(collectionId) {
		// eslint-disable-next-line react/no-access-state-in-setstate
		const oldSelected = this.state.selectedCollections;
		let newSelected;
		if (oldSelected.find(selectedId => selectedId === collectionId)) {
			newSelected = oldSelected.filter(selectedId => selectedId !== collectionId);
		}
		else {
			newSelected = oldSelected.push(collectionId) && oldSelected;
		}
		this.setState({
			selectedCollections: newSelected
		});
	}

	async getCollections() {
		// Get all collections of the user (unlikely that a user will have more than 10000 collections
		const req = await request.get(`/editor/${this.props.userId}/collections/collections?type=${this.props.entityType}&size=10000`);
		const collections = req.body;
		return collections;
	}

	handleClose() {
		this.setState({show: false}, this.props.closeCallback);
	}

	async handleAddToCollection() {
		const {bbids} = this.props;
		const {selectedCollections} = this.state;
		if (selectedCollections.length) {
			const promiseArray = [];
			selectedCollections.forEach((collectionId) => {
				const submissionURL = `/collection/${collectionId}/add`;
				promiseArray.push(
					request.post(submissionURL)
						.send({bbids})
				);
			});
			await Promise.all(promiseArray);
			this.setState({
				message: {
					text: 'Successfully added to selected collections',
					type: 'success'
				}
			});
		}
		else {
			this.setState({
				message: {
					text: 'No Collection Selected',
					type: 'danger'
				}
			});
		}
	}

	handleShowCollectionForm() {
		this.setState({message: {}, showCollectionForm: true});
	}

	handleShowAllCollections() {
		this.setState({message: {}, showCollectionForm: false});
	}

	handleAddToNewCollection(evt) {
		evt.preventDefault();

		if (!this.isValid()) {
			this.setState({
				message: {
					text: 'Incomplete Form',
					type: 'danger'
				}
			});
			return;
		}

		const description = this.description.getValue();
		const name = this.name.getValue();
		const privacy = this.privacy.getValue();
		const {entityType} = this.props;

		const data = {
			description,
			entityType,
			name,
			privacy
		};
		const {bbids} = this.props;
		request.post('/collection/create/handler')
			.send(data)
			.then((res) => {
				request.post(`/collection/${res.body.id}/add`)
					.send({bbids}).then(() => {
						this.setState({
							message: {
								text: `Successfully added to your new collection: ${name}`,
								type: 'success'
							}
						});
					});
			}, (error) => {
				this.setState({
					message: {
						text: 'Internal Error',
						type: 'danger'
					}
				});
			});
	}

	isValid() {
		return this.name.getValue() && this.privacy.getValue();
	}

	/* eslint-disable react/jsx-no-bind */
	render() {
		let messageComponent = null;
		if (this.state.message.text) {
			messageComponent = (
				<div>
					<Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>
				</div>
			);
		}

		let existingCollections;
		if (this.state.collectionsAvailable.length) {
			existingCollections = (
				<div>
					<h4>
						Select the collection in which you want to add this entity or create a new collection
					</h4>
					<div className="addToCollectionModal-body">
						{
							this.state.collectionsAvailable.map((collection) => ((
								<div key={collection.id}>
									<input
										checked={this.state.selectedCollections.find(selectedId => selectedId === collection.id)}
										id={collection.id}
										type="checkbox"
										onChange={() => this.toggleRow(collection.id)}
									/>
									<label className="label-checkbox" htmlFor={collection.id}>
										{collection.name}
									</label>
								</div>
							)))
						}
					</div>
				</div>
			);
		}
		else {
			existingCollections = (
				<div>
					Oops, Looks like you do not have any collection of type {this.props.entityType} . <br/>
					Click <a href="/collection/create">here</a> to create one
				</div>
			);
		}

		const privacyOptions = ['Private', 'Public'].map((option) => ({
			name: option
		}));
		const collectionForm = (
			<div>
				<Col
					id="collectionForm"
				>
					<form
						className="padding-sides-0 addToCollectionModal-body"
					>
						<CustomInput
							label="Name"
							ref={(ref) => this.name = ref}
							type="text"
						/>
						<CustomInput
							label="Description"
							ref={(ref) => this.description = ref}
							type="textarea"
						/>
						<SelectWrapper
							base={ReactSelect}
							idAttribute="name"
							label="Privacy"
							labelAttribute="name"
							options={privacyOptions}
							placeholder="Select Privacy"
							ref={(ref) => this.privacy = ref}
						/>
					</form>
				</Col>
			</div>
		);

		return (
			<Modal
				scrollable
				bsSize="large"
				show={this.state.show}
				onHide={this.handleClose}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						<h2>
							<strong>Select Collection</strong>
							{
								this.state.showCollectionForm ?
									<Button
										bsStyle="primary"
										className="pull-right"
										onClick={this.handleShowAllCollections}
									>
										Select from existing collections
									</Button> :
									<Button
										bsStyle="warning"
										className="pull-right"
										onClick={this.handleShowCollectionForm}
									>
										<FontAwesomeIcon icon="plus"/>
										&nbsp;Create a new collection
									</Button>
							}
						</h2>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{
						this.state.showCollectionForm ? collectionForm : existingCollections
					}
					{messageComponent}
				</Modal.Body>
				<Modal.Footer>
					{
						this.state.showCollectionForm ?
							<Button bsStyle="primary" onClick={this.handleAddToNewCollection}>
								<FontAwesomeIcon icon="plus"/> Add to this new collection
							</Button> :
							<Button bsStyle="primary" onClick={this.handleAddToCollection}>
								<FontAwesomeIcon icon="plus"/> Add to selected collections
							</Button>
					}
					<Button bsStyle="danger" onClick={this.handleClose}>
						<FontAwesomeIcon icon="times-circle"/> Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


AddToCollectionModal.displayName = 'DeleteCollectionModal';
AddToCollectionModal.propTypes = {
	bbids: PropTypes.array.isRequired,
	closeCallback: PropTypes.func.isRequired,
	entityType: PropTypes.string.isRequired,
	show: PropTypes.bool.isRequired,
	userId: PropTypes.number.isRequired
};

export default AddToCollectionModal;
