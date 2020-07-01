import * as bootstrap from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';


const {Alert, Button, Modal} = bootstrap;

class DeleteCollectionModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null
		};

		this.handleDelete = this.handleDelete.bind(this);
	}

	handleDelete() {
		request.post(this.deleteUrl)
			.send()
			.then((res) => {
				window.location.href = '/';
			}, (error) => {
				this.setState({
					error: 'Something went wrong! Please try again later'
				});
			});
	}

	render() {
		const {collection} = this.props;
		this.deleteUrl = `/collection/${collection.id}/delete/handler`;

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		return (
			<Modal
				show={this.props.show}
				onHide={this.props.handleCloseModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>Confirm deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Alert bsStyle="warning">
						<h4>
							<FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;
							You’re about to delete the Collection: {collection.name}.
						</h4>
						<p>
							Make sure you actually want to delete this Collection <br/>
							There is no way to undo this.
						</p>
					</Alert>
					{errorComponent}
				</Modal.Body>
				<Modal.Footer>
					<Button bsStyle="info" onClick={this.props.handleCloseModal}>
						Cancel
					</Button>
					<Button bsStyle="danger" onClick={this.handleDelete}>
						<FontAwesomeIcon icon="trash-alt"/> Delete
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


DeleteCollectionModal.displayName = 'DeleteCollectionModal';
DeleteCollectionModal.propTypes = {
	collection: PropTypes.object.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired
};

export default DeleteCollectionModal;
