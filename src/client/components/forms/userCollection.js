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
import CustomInput from '../../input';
import DeleteCollectionModal from '../pages/parts/delete-collection-modal';
import EntitySearchFieldOption from '../../entity-editor/common/entity-search-field-option';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import SelectWrapper from '../input/select-wrapper';
import classNames from 'classnames';
import request from 'superagent';
import {uniqBy} from 'lodash';


const {Alert, Button, Col} = bootstrap;

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
		this.handleShowDeleteModal = this.handleShowDeleteModal.bind(this);
		this.closeDeleteModalCallback = this.closeDeleteModalCallback.bind(this);
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
		const name = this.name.getValue();
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
		return this.name.getValue() && this.entityType.getValue();
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

	handleShowDeleteModal() {
		this.setState({showModal: true});
	}

	closeDeleteModalCallback() {
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
		const initialPrivacy = this.state.collection.public ? 'Public' : 'Private';
		const initialType = this.state.collection.entityType;
		const {errorText} = this.state;
		const errorAlertClass =
			classNames('text-center', 'margin-top-1', {hidden: !errorText});
		const submitLabel = this.props.collection.name ? 'Update collection' : 'Create collection';

		/* eslint-disable react/jsx-no-bind */
		return (
			<div>
				<h1>Create your collection</h1>
				<DeleteCollectionModal
					closeDeleteModalCallback={this.closeDeleteModalCallback}
					collection={this.props.collection}
					show={this.state.showModal}
				/>
				{
					this.props.collection.id ?
						<Button
							bsSize="small"
							bsStyle="danger"
							className="pull-right"
							type="button"
							onClick={this.handleShowDeleteModal}
						>
							<FontAwesomeIcon icon="times"/>&nbsp;Delete this collection
						</Button> : null
				}

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
								disabled={!this.props.canEditType}
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
							<div className="text-center">
								<Button
									bsStyle="primary"
									type="button"
									onClick={this.handleAddCollaborator}
								>
									<FontAwesomeIcon icon="plus"/>
									&nbsp;Add another collaborator
								</Button>
							</div>
							<div className="form-group text-center margin-top-1">
								<Button
									bsSize="large"
									bsStyle="success"
									type="submit"
								>
									{submitLabel}
								</Button>
							</div>
							<div className={errorAlertClass}>
								<Alert bsStyle="danger">Error: {errorText}</Alert>
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
	canEditType: PropTypes.bool,
	collection: PropTypes.shape({
		collaborators: PropTypes.array,
		description: PropTypes.string,
		entityType: PropTypes.string,
		id: PropTypes.string,
		isEdit: PropTypes.bool,
		name: PropTypes.string,
		public: PropTypes.bool
	})
};
UserCollectionForm.defaultProps = {
	canEditType: true,
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

export default UserCollectionForm;
