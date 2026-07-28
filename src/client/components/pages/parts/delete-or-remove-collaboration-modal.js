import * as bootstrap from 'react-bootstrap';
import {faExclamationTriangle, faTimesCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';
import {withTranslation} from 'react-i18next';


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
		const {t: translate} = this.props;
		request.post(this.postUrl)
			.send(this.postData)
			.then(() => {
				window.location.href = `/editor/${this.props.userId}/collections`;
			}, () => {
				this.setState({
					error: translate('common:error')
				});
			});
	}

	render() {
		const {collection, t: translate} = this.props;
		// eslint-disable-next-line one-var
		let modalBody, modalTitle, submitButton;
		if (this.props.isDelete) {
			this.postUrl = `/collection/${collection.id}/delete/handler`;
			this.postData = {};
			modalTitle = translate('common:confirmDeletion');
			modalBody = (
				<Alert variant="danger">
					<h4>
						<FontAwesomeIcon icon={faExclamationTriangle}/>&nbsp;
						{translate('collection.deleteNotice', {name: collection.name})}
					</h4>
					<p>
						{translate('collection.deleteWarning')} <br/>
						{translate('collection.deleteUndoWarning')}
					</p>
				</Alert>
			);
			submitButton = (
				<Button variant="danger" onClick={this.handleSubmit}>
					<FontAwesomeIcon icon={faTrashAlt}/>&nbsp;{translate('common:button.delete')}
				</Button>
			);
		}
		else {
			// loggedInUser must be collaborator here
			this.postUrl = `/collection/${collection.id}/collaborator/remove`;
			this.postData = {collaboratorIds: [this.props.userId]};
			modalTitle = translate('collection.stopCollaborationTooltip');
			modalBody = (
				<Alert variant="warning">
					<h4>
						<FontAwesomeIcon icon={faExclamationTriangle}/>&nbsp;
						{translate('collection.stopCollaborationNotice', {name: collection.name})}
					</h4>
					<p>
						{translate('collection.stopCollaborationWarning')}
					</p>
				</Alert>
			);
			submitButton = (
				<Button variant="warning" onClick={this.handleSubmit}>
					<FontAwesomeIcon icon={faTimesCircle}/>&nbsp;{translate('collection.stopCollaboration')}
				</Button>
			);
		}

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert variant="danger">{this.state.error}</Alert>;
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
					<Button variant="info" onClick={this.props.onCloseModal}>
						{translate('common:button.cancel')}
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
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
	userId: PropTypes.number.isRequired
};
DeleteOrRemoveCollaborationModal.defaultProps = {
	isDelete: true
};

export default withTranslation(['pages', 'common'])(DeleteOrRemoveCollaborationModal);
