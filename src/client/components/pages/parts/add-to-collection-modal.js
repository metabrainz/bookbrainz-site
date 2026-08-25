import * as bootstrap from 'react-bootstrap';
import {faPlus, faTimes} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import _ from 'lodash';
import request from 'superagent';
import {withTranslation} from 'react-i18next';


const {Alert, Col, Button, Form, Modal} = bootstrap;

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
			showCollectionForm: false
		};

		this.getCollections = this.getCollections.bind(this);
		this.handleAddToCollection = this.handleAddToCollection.bind(this);
		this.toggleRow = this.toggleRow.bind(this);
		this.handleShowCollectionForm = this.handleShowCollectionForm.bind(this);
		this.handleShowAllCollections = this.handleShowAllCollections.bind(this);
		this.handleAddToNewCollection = this.handleAddToNewCollection.bind(this);
		this.isValid = this.isValid.bind(this);
	}

	async componentDidMount() {
		const collections = this.props.entityType ? await this.getCollections() : [];
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({collectionsAvailable: collections || []});
	}

	async componentDidUpdate(prevProps) {
		if (prevProps.entityType !== this.props.entityType) {
			const collections = this.props.entityType ? await this.getCollections() : [];
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({collectionsAvailable: collections || []});
		}
	}

	toggleRow(collectionId) {
		const oldSelected = this.state.selectedCollections;
		let newSelected;
		if (oldSelected.find(selectedId => selectedId === collectionId)) {
			newSelected = oldSelected.filter(selectedId => selectedId !== collectionId);
		}
		else {
			newSelected = [...oldSelected, collectionId];
		}
		this.setState({
			selectedCollections: newSelected
		});
	}

	async getCollections() {
		try {
			// Get all collections of the user (unlikely that a user will have more than 10000 collections
			const req = await request.get(`/editor/${this.props.userId}/collections/collections?type=${this.props.entityType}&size=10000`);
			const collections = req.body;
			return collections;
		}
		catch (err) {
			return this.setState({
				message: {
					text: this.props.t('pages.collection.fetchCollectionsError'),
					type: 'danger'
				}
			});
		}
	}

	async handleAddToCollection() {
		const {bbids} = this.props;
		const {selectedCollections} = this.state;
		if (selectedCollections.length) {
			try {
				const promiseArray = [];
				selectedCollections.forEach((collectionId) => {
					const submissionURL = `/collection/${collectionId}/add`;
					promiseArray.push(
						request.post(submissionURL)
							.send({bbids})
					);
				});
				await Promise.all(promiseArray);
				this.setState({selectedCollections: []}, () => {
					this.props.closeModalAndShowMessage({
						text: this.props.t(
							selectedCollections.length > 1 ?
								'pages.collection.successAddCollections' :
								'pages.collection.successAddCollection'
						),
						type: 'success'
					});
				});
			}
			catch (err) {
				this.setState({
					message: {
						text: this.props.t('common.error'),
						type: 'danger'
					}
				});
			}
		}
		else {
			this.setState({
				message: {
					text: this.props.t('pages.collection.noCollectionSelectedError'),
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
					text: this.props.t('pages.collection.incompleteFormError'),
					type: 'danger'
				}
			});
			return;
		}

		const description = this.description.value;
		const name = this.name.value;
		const privacy = this.privacy.select.getValue();
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
						this.setState({selectedCollections: []}, () => {
							this.props.closeModalAndShowMessage({
								text: this.props.t('pages.collection.successAddNewCollection', {name}),
								type: 'success'
							});
						});
					});
			}, () => {
				this.setState({
					message: {
						text: this.props.t('common.error'),
						type: 'danger'
					}
				});
			});
	}

	isValid() {
		return _.trim(this.name.value).length && this.privacy.select.getValue().length;
	}

	getOptionLabel(option) {
		return option.name;
	}

	getOptionValue(option) {
		return option.name;
	}

	/* eslint-disable react/jsx-no-bind */
	render() {
		const {t: translate} = this.props;

		let messageComponent = null;
		if (this.state.message.text) {
			messageComponent = (
				<div>
					<Alert variant={this.state.message.type}>{this.state.message.text}</Alert>
				</div>
			);
		}

		let existingCollections;
		if (this.state.collectionsAvailable.length) {
			existingCollections = (
				<div>
					<h4>
						{translate('pages.collection.selectOrCreatePrompt')}
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
					{translate('pages.collection.noCollectionsPrompt', {type: this.props.entityType})}
				</div>
			);
		}

		const privacyOptions = [
			{label: translate('common.private'), name: 'Private'},
			{label: translate('common.public'), name: 'Public'}
		];
		const collectionForm = (
			<div>
				<Col
					id="collectionForm"
				>
					<form
						className="padding-sides-0 addToCollectionModal-body"
					>
						<Form.Group>
							<Form.Label>{translate('common.name')}</Form.Label>
							<Form.Control
								ref={(ref) => this.name = ref}
								type="text"
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>{translate('common.description')}</Form.Label>
							<Form.Control
								as="textarea"
								ref={(ref) => this.description = ref}
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>{translate('common.privacy')}</Form.Label>
							<ReactSelect
								classNamePrefix="react-select"
								getOptionLabel={(option) => option.label || option.name}
								getOptionValue={this.getOptionValue}
								menuPosition="fixed"
								options={privacyOptions}
								placeholder={translate('pages.collection.selectPrivacyPlaceholder')}
								ref={(ref) => this.privacy = ref}
							/>
						</Form.Group>
					</form>
				</Col>
			</div>
		);

		return (
			<Modal
				scrollable
				show={this.props.show}
				onHide={this.props.handleCloseModal}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						{this.state.showCollectionForm ?
							translate('pages.collection.createCollection') :
							translate('pages.collection.selectCollection')}
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
							<Button
								variant="primary"
								onClick={this.handleShowAllCollections}
							>
								{translate('pages.collection.selectFromCollections')}
							</Button> :
							<Button
								variant="warning"
								onClick={this.handleShowCollectionForm}
							>
								<FontAwesomeIcon icon={faPlus}/>
								&nbsp;{translate('pages.collection.newCollectionButton')}
							</Button>
					}
					{
						this.state.showCollectionForm ?
							<Button variant="success" onClick={this.handleAddToNewCollection}>
								<FontAwesomeIcon icon={faPlus}/> {translate('pages.collection.addToNewCollection')}
							</Button> :
							<Button
								disabled={!this.state.collectionsAvailable.length}
								variant="success"
								onClick={this.handleAddToCollection}
							>
								<FontAwesomeIcon icon={faPlus}/>
								{this.state.selectedCollections.length > 1 ?
									translate('pages.collection.addToSelectedCollections') :
									translate('pages.collection.addToSelectedCollection')}
							</Button>
					}
					<Button variant="danger" onClick={this.props.handleCloseModal}>
						<FontAwesomeIcon icon={faTimes}/> {translate('common.button.close')}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


AddToCollectionModal.displayName = 'AddToCollectionModal';
AddToCollectionModal.propTypes = {
	bbids: PropTypes.array.isRequired,
	closeModalAndShowMessage: PropTypes.func.isRequired,
	entityType: PropTypes.string.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired,
	userId: PropTypes.number.isRequired
};

export default withTranslation()(AddToCollectionModal);
