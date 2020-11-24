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
import {trim, uniqBy} from 'lodash';
import CustomInput from '../../input';
import DeleteOrRemoveCollaborationModal from '../pages/parts/delete-or-remove-collaboration-modal';
import EntitySearchFieldOption from '../../entity-editor/common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import SelectWrapper from '../input/select-wrapper';
import classNames from 'classnames';
import request from 'superagent';


const {Alert, Button, ButtonGroup, Col} = bootstrap;

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
				errorText: 'Incomplete Form'
			});
			return;
		}

		const collaborators = this.getCleanedCollaborators();
		const description = this.description.getValue();
		const name = trim(this.name.getValue());
		const privacy = this.privacy.getValue();
		const entityType = this.entityType.getValue();

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
			}, (error) => {
				this.setState({
					errorText: 'Internal Error'
				});
			});
	}

	isValid() {
		return trim(this.name.getValue()).length && this.entityType.getValue();
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

	render() {
		if (this.state.collaborators.length === 0) {
			this.handleAddCollaborator();
		}

		const privacyOptions = ['Private', 'Public'].map((option) => ({
			name: option
		}));
		const entityTypeOptions = ['Author', 'Work', 'Edition', 'Edition-Group', 'Publisher'].map((entity) => ({
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
		const errorAlertClass = classNames('text-center', 'margin-top-1', {hidden: !errorText});
		const submitLabel = this.props.collection.name ? 'Update collection' : 'Create collection';
		const canEditType = this.props.collection.items.length === 0;

		/* eslint-disable react/jsx-no-bind */
		return (
			<div>
				<h1>Create your collection</h1>
				<DeleteOrRemoveCollaborationModal
					collection={this.props.collection}
					show={this.state.showModal}
					userId={this.props.collection.ownerId}
					onCloseModal={this.handleCloseModal}
				/>
				<div>
					<Col
						id="collectionForm"
						md={8}
						mdOffset={2}
					>
						<form
							className="padding-sides-0"
							onSubmit={this.handleSubmit}
						>
							<CustomInput
								defaultValue={initialName}
								label="Name"
								ref={(ref) => this.name = ref}
								type="text"
							/>
							<CustomInput
								defaultValue={initialDescription}
								label="Description"
								ref={(ref) => this.description = ref}
								type="textarea"
							/>
							<SelectWrapper
								base={ReactSelect}
								defaultValue={initialType}
								disabled={!canEditType}
								idAttribute="name"
								label="Entity Type"
								labelAttribute="name"
								options={entityTypeOptions}
								placeholder="Select Entity Type"
								ref={(ref) => this.entityType = ref}
							/>
							<SelectWrapper
								base={ReactSelect}
								defaultValue={initialPrivacy}
								idAttribute="name"
								label="Privacy"
								labelAttribute="name"
								options={privacyOptions}
								placeholder="Select Privacy"
								ref={(ref) => this.privacy = ref}
							/>
							<h3><b>Collaborators</b></h3>
							<p className="help-block">
								Collaborators can add/remove entities from your collection
							</p>
							{
								this.state.collaborators.map((collaborator, index) => {
									const buttonAfter = (
										<Button
											bsSize="small"
											bsStyle="danger"
											type="button"
											onClick={() => this.handleRemoveCollaborator(index)}
										>
											<FontAwesomeIcon icon="times"/>&nbsp;Remove
										</Button>
									);
									return (
										<div key={collaborator.id}>
											<EntitySearchFieldOption
												buttonAfter={buttonAfter}
												instanceId="collaboratorSearchField"
												label="Select Collaborator"
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
								<Alert bsStyle="danger">Error: {errorText}</Alert>
							</div>
							<div className="row margin-bottom-2">
								<div className="col-sm-6 margin-top-d5">
									<Button
										block
										bsStyle="primary"
										type="button"
										onClick={this.handleAddCollaborator}
									>
										<FontAwesomeIcon icon="plus"/>
										&nbsp;Add another collaborator
									</Button>
								</div>
								<div className="col-sm-6 margin-top-d5">
									<Button
										block
										bsStyle="success"
										type="submit"
									>
										<FontAwesomeIcon icon="save"/>&nbsp;{submitLabel}
									</Button>
								</div>
								{
									this.props.collection.id ?
										<div className="col-sm-6 margin-top-d5">
											<Button
												block
												bsStyle="danger"
												type="button"
												onClick={this.handleShowModal}
											>
												<FontAwesomeIcon icon="trash-alt"/>&nbsp;Delete collection
											</Button>
										</div> : null
								}
							</div>
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
	})
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

export default UserCollectionForm;
