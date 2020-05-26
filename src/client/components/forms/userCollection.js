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
import EntitySearchFieldOption from '../../entity-editor/common/entity-search-field-option';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import SelectWrapper from '../input/select-wrapper';
import request from 'superagent-bluebird-promise';


const {Button, Col, Grid, Row} = bootstrap;

class UserCollectionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			collection: props.collection
		};

		// React does not autobind non-React class methods
		this.getCleanedCollaborators = this.getCleanedCollaborators.bind(this);
		this.handleAddCollaborator = this.handleAddCollaborator.bind(this);
		this.handleRemoveCollaborator = this.handleRemoveCollaborator.bind(this);
		this.handleChangeCollaborator = this.handleChangeCollaborator.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.isValid = this.isValid.bind(this);
	}

	handleSubmit(evt) {
		evt.preventDefault();

		if (!this.isValid()) {
			return;
		}

		const collaborators = this.getCleanedCollaborators();
		const description = this.description.getValue();
		const name = this.name.getValue();
		const privacy = this.privacy.getValue();
		const type = this.type.getValue();

		const data = {
			collaborators,
			description,
			name,
			privacy,
			type
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
			.promise()
			.then((response) => {
				if (response.status === 200) {
					window.location.href = `/collection/${response.body.id}`;
				}
				else {
					// show error pagee
				}
			});
	}

	isValid() {
		return this.name.getValue() && this.type.getValue();
	}

	getCleanedCollaborators() {
		const cleanedCollaborators = this.state.collection.collaborators.filter(collaborator => collaborator && collaborator.id !== null);
		return cleanedCollaborators;
	}

	handleAddCollaborator() {
		const newCollaborators = this.state.collection.collaborators;
		newCollaborators.push({
			id: null,
			name: ''
		});
		this.setState(prevState => ({
			collection: {
				...prevState.collection,
				collaborators: newCollaborators
			}
		}));
	}

	handleRemoveCollaborator(index) {
		const newCollaborators = this.state.collection.collaborators;
		newCollaborators.splice(index, 1);
		this.setState(prevState => ({
			collection: {
				...prevState.collection,
				collaborators: newCollaborators
			}
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
		const newCollaborators = this.state.collection.collaborators;
		newCollaborators[index] = newCollaborator;
		this.setState(prevState => ({
			collection: {
				...prevState.collection,
				collaborators: newCollaborators
			}
		}));
	}

	render() {
		if (this.state.collection.collaborators.length === 0) {
			this.handleAddCollaborator();
		}

		const privacyOptions = ['Private', 'Public'].map((option) => ({
			name: option
		}));
		const typeOptions = ['Author', 'Work', 'Edition', 'Edition-Group', 'Publisher'].map((entity) => ({
			name: entity
		}));
		const initialName = this.state.collection.name;
		const initialDescription = this.state.collection.description;
		const initialPrivacy = this.state.collection.public ? 'Public' : 'Private';
		const initialType = this.state.collection.type;

		/* eslint-disable react/jsx-no-bind */
		return (
			<Grid>
				<h1>Create a collection</h1>
				<Row>
					<Col md={12}>
						<p className="lead">Create Your Collection</p>
					</Col>
				</Row>
				<Row>
					<Col
						id="collectionForm"
						md={6}
						mdOffset={3}
					>
						<form
							className="form-horizontal"
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
								idAttribute="name"
								label="Type"
								labelAttribute="name"
								options={typeOptions}
								placeholder="Select Type"
								ref={(ref) => this.type = ref}
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
							{
								this.state.collection.collaborators.map((collaborator, index) => (
									<div key={collaborator.id}>
										<EntitySearchFieldOption
											instanceId="collaboratorSearchField"
											label="Select Collaborator"
											name="editor"
											type="editor"
											value={collaborator}
											onChange={(newCollaborator) => this.handleChangeCollaborator(newCollaborator, index)}
										/>
										<Button
											bsSize="small"
											bsStyle="primary"
											type="button"
											onClick={() => this.handleRemoveCollaborator(index)}
										>
											Remove
										</Button>
									</div>
								))
							}
							<Button
								type="button"
								onClick={this.handleAddCollaborator}
							>
								Add Collaborator
							</Button>
							<div className="form-group text-center">
								<Button
									bsSize="large"
									bsStyle="primary"
									type="submit"
								>
									Create
								</Button>
							</div>
						</form>
					</Col>
				</Row>
			</Grid>
		);
	}
}

UserCollectionForm.displayName = 'UserCollectionForm';
UserCollectionForm.propTypes = {
	collection: PropTypes.shape({
		collaborators: PropTypes.array,
		description: PropTypes.string,
		id: PropTypes.string,
		isEdit: PropTypes.bool,
		name: PropTypes.string,
		public: PropTypes.bool,
		type: PropTypes.string
	})
};
UserCollectionForm.defaultProps = {
	collection: {
		collaborators: [],
		description: '',
		id: null,
		isEdit: false,
		name: null,
		public: false,
		type: null
	}
};

export default UserCollectionForm;
