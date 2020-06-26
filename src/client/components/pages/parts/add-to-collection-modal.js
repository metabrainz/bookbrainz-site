import * as bootstrap from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';


const {Alert, Button, Modal} = bootstrap;

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
			show: this.props.show
		};

		this.handleClose = this.handleClose.bind(this);
		this.getCollections = this.getCollections.bind(this);
		this.handleAddToCollection = this.handleAddToCollection.bind(this);
		this.toggleRow = this.toggleRow.bind(this);
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

	/* eslint-disable react/jsx-no-bind */
	render() {
		let messageComponent = null;
		if (this.state.message.text) {
			messageComponent =
				<Alert bsStyle={this.state.message.type}>{this.state.message.text}</Alert>;
		}

		return (
			<Modal
				scrollable
				show={this.state.show}
				onHide={this.handleClose}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						<h2>
							<strong>Select Collection</strong>
						</h2>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{
						this.state.collectionsAvailable.length ?
							<div>
								<h4>
									Select the collection in which you want to add this entity or create a new collection
								</h4>
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
							</div> :
							<div>
								Oops, Looks like you do not have any collection of type {this.props.entityType} . <br/>
								Click <a href="/collection/create">here</a> to create one
							</div>
					}
					{messageComponent}
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="primary" onClick={this.handleAddToCollection}>
						<FontAwesomeIcon icon="plus"/> Add to selected collections
					</Button>
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
