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
import {faPlus, faSave, faTimes, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {trim, uniqBy} from 'lodash';
import DeleteOrRemoveCollaborationModal from '../pages/parts/delete-or-remove-collaboration-modal';
import EntitySearchFieldOption from '../../entity-editor/common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import classNames from 'classnames';
import request from 'superagent';
import {withTranslation} from 'react-i18next';


const {Alert, Button, Col, Form, Row} = bootstrap;

class UserCollectionForm extends React.Component {
	constructor(props) {
		super(props);

		const {collaborators, ...collection} = props.collection;
		this.state = {
			collaborators,
			collection,
			errorText: null,
			showModal: false
		};

		// React does not autobind non-React class methods
		this.getCleanedCollaborators = this.getCleanedCollaborators.bind(this);
		this.handleAddCollaborator = this.handleAddCollaborator.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);
		this.handleCloseModal = this.handleCloseModal.bind(this);
		this.handleRemoveCollaborator = this.handleRemoveCollaborator.bind(this);
		this.handleChangeCollaborator = this.handleChangeCollaborator.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.isValid = this.isValid.bind(this);
	}

	handleSubmit(evt) {
		evt.preventDefault();
		if (!this.isValid()) {
			this.setState({
				errorText: this.props.t('pages.collection.incompleteFormError')
			});
			return;
		}
		const collaborators = this.getCleanedCollaborators();
		const description = this.description.value;
		const name = trim(this.name.value);
		const privacy = this.privacy.select.getValue()[0].name;
		const entityType = this.entityType.select.getValue()[0].name;

		const data = {
			collaborators,
			description,
			entityType,
			name,
			privacy
		};

		let submissionURL;
		if (this.props.collection.id) {
			submissionURL = `/collection/${this.props.collection.id}/edit/handler`;
		}
		else {
			submissionURL = '/collection/create/handler';
		}
		request.post(submissionURL)
			.send(data)
			.then((res) => {
				window.location.href = `/collection/${res.body.id}`;
			}, () => {
				this.setState({
					errorText: this.props.t('common.error')
				});
			});
	}

	isValid() {
		return trim(this.name.value).length && this.entityType.select.getValue().length;
	}

	getCleanedCollaborators() {
		const cleanedCollaborators = uniqBy(this.state.collaborators.filter(collaborator => collaborator && collaborator.id !== null), 'id');
		return cleanedCollaborators;
	}

	handleAddCollaborator() {
		this.setState(prevState => ({
			collaborators: [...prevState.collaborators, {id: null, name: ''}]
		}));
	}

	handleRemoveCollaborator(index) {
		this.setState(prevState => ({
			collaborators: prevState.collaborators.splice(index, 1) && prevState.collaborators
		}));
	}

	handleChangeCollaborator(newCollab, index) {
		let newCollaborator;
		if (!newCollab) {
			newCollaborator = {
				id: null,
				name: ''
			};
		}
		else {
			newCollaborator = newCollab;
		}

		this.setState((prevState) => {
			const newCollaborators = prevState.collaborators;
			newCollaborators[index] = newCollaborator;
			return {
				collaborators: newCollaborators
			};
		});
	}

	handleShowModal() {
		this.setState({showModal: true});
	}

	handleCloseModal() {
		this.setState({showModal: false});
	}

	getOptionLabel(option) {
		return option.name;
	}

	getOptionValue(option) {
		return option.name;
	}

	render() {
		const {t: translate} = this.props;
		if (this.state.collaborators.length === 0) {
			this.handleAddCollaborator();
		}

		const privacyOptions = [
			{label: translate('common.private'), name: 'Private'},
			{label: translate('common.public'), name: 'Public'}
		];
		const entityTypeOptions = ['Author', 'Work', 'Series', 'Edition', 'Edition-Group', 'Publisher'].map((entity) => ({
			name: entity
		}));
		const initialName = this.state.collection.name;
		const initialDescription = this.state.collection.description;
		const initialType = this.state.collection.entityType;
		let initialPrivacy;
		if (this.props.collection.name) {
			initialPrivacy = this.state.collection.public ? 'Public' : 'Private';
		}
		else {
			initialPrivacy = 'Public';
		}
		const {errorText} = this.state;
		const errorAlertClass = classNames('text-center', 'margin-top-1', {'d-none': !errorText});
		const submitLabel = this.props.collection.name ?
			translate('pages.collection.updateCollection') :
			translate('pages.collection.createCollection');
		const canEditType = this.props.collection.items.length === 0;

		/* eslint-disable react/jsx-no-bind */
		return (
			<div>
				<h1>{translate('pages.collection.createHeading')}</h1>
				<DeleteOrRemoveCollaborationModal
					collection={this.props.collection}
					show={this.state.showModal}
					userId={this.props.collection.ownerId}
					onCloseModal={this.handleCloseModal}
				/>
				<div>
					<Col
						id="collectionForm"
						lg={{offset: 2, span: 8}}
					>
						<form
							className="padding-sides-0"
							onSubmit={this.handleSubmit}
						>
							<Form.Group>
								<Form.Label>{translate('common.name')}</Form.Label>
								<Form.Control
									defaultValue={initialName}
									ref={(ref) => this.name = ref}
									type="text"
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label>{translate('common.description')}</Form.Label>
								<Form.Control
									as="textarea"
									defaultValue={initialDescription}
									ref={(ref) => this.description = ref}
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label>{translate('pages.collections.headerEntityType')}</Form.Label>
								<ReactSelect
									classNamePrefix="react-select"
									defaultValue={entityTypeOptions.filter((option) => option.name === initialType)}
									getOptionLabel={this.getOptionLabel}
									getOptionValue={this.getOptionValue}
									instanceId="title"
									isDisabled={!canEditType}
									options={entityTypeOptions}
									placeholder={translate('pages.collection.selectTypePlaceholder')}
									ref={(ref) => this.entityType = ref}
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label>{translate('pages.collections.headerPrivacy')}</Form.Label>
								<ReactSelect
									classNamePrefix="react-select"
									defaultValue={privacyOptions.filter((option) => option.name === initialPrivacy)}
									getOptionLabel={(option) => option.label || option.name}
									getOptionValue={this.getOptionValue}
									instanceId="Privacy"
									options={privacyOptions}
									placeholder={translate('pages.collection.selectPrivacyPlaceholder')}
									ref={(ref) => this.privacy = ref}
								/>
							</Form.Group>
							<h3><b>{translate('common.collaborator_other')}</b></h3>
							<Row className="margin-bottom-2">
								<Col className="margin-top-d5" md={6}>
									<p className="text-muted">
										{translate('pages.collection.collaboratorsDescription')}
									</p>
								</Col>
								<Col className="margin-top-d5" md={6}>
									<Button
										block
										type="button"
										variant="primary"
										onClick={this.handleAddCollaborator}
									>
										<FontAwesomeIcon icon={faPlus}/>
										&nbsp;{translate('pages.collection.addAnotherCollaborator')}
									</Button>
								</Col>
							</Row>
							{
								this.state.collaborators.map((collaborator, index) => {
									const buttonAfter = (
										<Button
											size="sm"
											type="button"
											variant="danger"
											onClick={() => this.handleRemoveCollaborator(index)}
										>
											<FontAwesomeIcon icon={faTimes}/>&nbsp;{translate('common.button.remove')}
										</Button>
									);
									return (
										<div key={collaborator.id}>
											<EntitySearchFieldOption
												buttonAfter={buttonAfter}
												instanceId="collaboratorSearchField"
												label={translate('pages.collection.selectCollaboratorLabel')}
												name="editor"
												type="editor"
												value={collaborator}
												onChange={(newCollaborator) => this.handleChangeCollaborator(newCollaborator, index)}
											/>
										</div>
									);
								})
							}
							<hr/>
							<div className={errorAlertClass}>
								<Alert variant="danger">{translate('common.errorLabel')} {errorText}</Alert>
							</div>
							<Row className="margin-bottom-2">
								<Col className="margin-top-d5" md={6}>
									<Button
										block
										type="submit"
										variant="success"
									>
										<FontAwesomeIcon icon={faSave}/>&nbsp;{submitLabel}
									</Button>
								</Col>
								{
									this.props.collection.id ?
										<Col className="margin-top-d5" md={6}>
											<Button
												block
												type="button"
												variant="danger"
												onClick={this.handleShowModal}
											>
												<FontAwesomeIcon icon={faTrashAlt}/>
												&nbsp;{translate('pages.collection.deleteCollection')}
											</Button>
										</Col> : null
								}
							</Row>
						</form>
					</Col>
				</div>
			</div>

		);
	}
}

UserCollectionForm.displayName = 'UserCollectionForm';
UserCollectionForm.propTypes = {
	collection: PropTypes.shape({
		collaborators: PropTypes.array,
		description: PropTypes.string,
		entityType: PropTypes.string,
		id: PropTypes.string,
		items: PropTypes.array,
		name: PropTypes.string,
		ownerId: PropTypes.number,
		public: PropTypes.bool
	}),
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired
};
UserCollectionForm.defaultProps = {
	collection: {
		collaborators: [],
		description: '',
		entityType: null,
		id: null,
		items: [],
		name: null,
		ownerId: null,
		public: false
	}
};

export default withTranslation()(UserCollectionForm);
