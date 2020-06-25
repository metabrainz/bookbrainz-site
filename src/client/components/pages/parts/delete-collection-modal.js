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
			error: null,
			show: this.props.show
		};

		this.handleClose = this.handleClose.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.show !== this.props.show) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({show: this.props.show});
		}
	}

	handleClose() {
		this.setState({show: false}, this.props.closeDeleteModalCallback);
	}

	handleDelete() {
		request.post(this.deleteUrl)
			.send()
			.then((res) => {
				window.location.href = '/';
			}, (error) => {
				this.setState({
					error: 'Internal Error'
				});
			});
	}

	render() {
		const {collection} = this.props;
		this.collectionUrl = `/collection/${collection.id}`;
		this.deleteUrl = `${this.collectionUrl}/delete/handler`;

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		return (
			<Modal
				show={this.state.show}
				onHide={this.handleClose}
			>
				<Modal.Header closeButton>
					<Modal.Title>Confirm Deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Alert bsStyle="warning">
						<h4>
							<FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;
							You’re about to delete the Collection - {collection.name}.
						</h4>
					</Alert>
					<p>
						Make sure you actually want to delete this Collection <br/>
						There is no way to undo this.
					</p>
					{errorComponent}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={this.handleClose}>
						<FontAwesomeIcon icon="times-circle"/> Cancel
					</Button>
					<Button onClick={this.handleDelete}>
						<FontAwesomeIcon icon="trash-alt"/> Delete
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


DeleteCollectionModal.displayName = 'DeleteCollectionModal';
DeleteCollectionModal.propTypes = {
	closeDeleteModalCallback: PropTypes.func.isRequired,
	collection: PropTypes.shape({
		collaborators: PropTypes.array,
		description: PropTypes.string,
		entityType: PropTypes.string,
		id: PropTypes.string,
		isEdit: PropTypes.bool,
		name: PropTypes.string,
		public: PropTypes.bool
	}),
	show: PropTypes.bool.isRequired
};
DeleteCollectionModal.defaultProps = {
	collection: {
		collaborators: [],
		description: '',
		entityType: null,
		id: null,
		isEdit: false,
		name: null,
		public: false
	}
};

export default DeleteCollectionModal;
