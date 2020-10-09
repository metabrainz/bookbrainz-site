import * as bootstrap from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';


const {Alert, Button, Modal} = bootstrap;

class DeleteOrRemoveCollaborationModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit() {
		request.post(this.postUrl)
			.send(this.postData)
			.then((res) => {
				window.location.href = `/editor/${this.props.userId}/collections`;
			}, (error) => {
				this.setState({
					error: 'Something went wrong! Please try again later'
				});
			});
	}

	render() {
		const {collection} = this.props;
		// eslint-disable-next-line one-var
		let modalBody, modalTitle, submitButton;
		if (this.props.isDelete) {
			this.postUrl = `/collection/${collection.id}/delete/handler`;
			this.postData = {};
			modalTitle = 'Confirm deletion';
			modalBody = (
				<Alert bsStyle="danger">
					<h4>
						<FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;
						You’re about to delete the Collection: {collection.name}.
					</h4>
					<p>
						Make sure you actually want to delete this Collection <br/>
						There is no way to undo this.
					</p>
				</Alert>
			);
			submitButton = (
				<Button bsStyle="danger" onClick={this.handleSubmit}>
					<FontAwesomeIcon icon="trash-alt"/> Delete
				</Button>
			);
		}
		else {
			// loggedInUser must be collaborator here
			this.postUrl = `/collection/${collection.id}/collaborator/remove`;
			this.postData = {collaboratorIds: [this.props.userId]};
			modalTitle = 'Remove yourself as a collaborator';
			modalBody = (
				<Alert bsStyle="warning">
					<h4>
						<FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;
						You’re about to remove yourself as a collaborator of Collection: {collection.name}.
					</h4>
					<p>
						Are you sure you want to proceed ? You won’t be able to undo this yourself
						and will need to ask the collection&apos;s owner to add you again.
					</p>
				</Alert>
			);
			submitButton = (
				<Button bsStyle="warning" onClick={this.handleSubmit}>
					<FontAwesomeIcon icon="times-circle"/> Stop collaboration
				</Button>
			);
		}

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		return (
			<Modal
				show={this.props.show}
				onHide={this.props.onCloseModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>{modalTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{modalBody}
					{errorComponent}
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="info" onClick={this.props.onCloseModal}>
						Cancel
					</Button>
					{submitButton}
				</Modal.Footer>
			</Modal>
		);
	}
}


DeleteOrRemoveCollaborationModal.displayName = 'DeleteOrRemoveCollaborationModal';
DeleteOrRemoveCollaborationModal.propTypes = {
	collection: PropTypes.object.isRequired,
	isDelete: PropTypes.bool,
	onCloseModal: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	userId: PropTypes.number.isRequired
};
DeleteOrRemoveCollaborationModal.defaultProps = {
	isDelete: true
};

export default DeleteOrRemoveCollaborationModal;
