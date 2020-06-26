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
			show: this.props.show
		};

		this.handleClose = this.handleClose.bind(this);
		this.getCollections = this.getCollections.bind(this);
	}

	async componentDidUpdate(prevProps) {
		const collections = await this.getCollections();
		if (prevProps.show !== this.props.show) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({collectionsAvailable: collections, show: this.props.show});
		}
	}

	async getCollections() {
		const req = await request.get(`/editor/${this.props.user.id}/collections/collections?type=${this.props.entityType}`);
		const collections = req.body;
		return collections;
	}

	handleClose() {
		this.setState({show: false}, this.props.closeCallback);
	}

	handleAddToCollection(collection) {
		const {entities} = this.props;
		const submissionURL = `/collection/${collection.id}/add`;
		request.post(submissionURL)
			.send({entities})
			.then((res) => {
				this.setState({
					message: {
						text: `Added to ${collection.name}`,
						type: 'success'
					}
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
					<Modal.Title>Select Collection</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{
						this.state.collectionsAvailable.length ?
							<div>
								<h4>
									Click the collection in which you want this to be added
								</h4>
								<ol>
									{
										this.state.collectionsAvailable.map((collection) => ((
											<li key={collection.id}>
												<a href="#" onClick={() => this.handleAddToCollection(collection)}>
													{collection.name}
												</a>
											</li>
										)))
									}
								</ol>
							</div> :
							<div>
								Oops, Looks like you do not have any collection of type {this.props.entityType} . <br/>
								Click <a href="/collection/create">here</a> to create one
							</div>
					}
					{messageComponent}
				</Modal.Body>
				<Modal.Footer>
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
	closeCallback: PropTypes.func.isRequired,
	entities: PropTypes.array.isRequired,
	entityType: PropTypes.string.isRequired,
	show: PropTypes.bool.isRequired,
	user: PropTypes.object.isRequired
};

export default AddToCollectionModal;
