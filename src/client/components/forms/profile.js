/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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
import * as utilsHelper from '../../helpers/utils';
import * as validators from '../../helpers/react-validators';
import CustomInput from '../../input';
import LoadingSpinner from '../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import SearchSelect from '../input/entity-search';
import SelectWrapper from '../input/select-wrapper';
import request from 'superagent';


const {Button, Col, Grid, Row} = bootstrap;
const {injectDefaultAliasName} = utilsHelper;

class ProfileForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			area: props.editor.area ?
				props.editor.area : null,
			bio: props.editor.bio,
			gender: props.editor.gender ?
				props.editor.gender : null,
			genders: props.genders,
			name: props.editor.name,
			titles: props.titles,
			waiting: false
		};

		// React does not autobind non-React class methods
		this.handleSubmit = this.handleSubmit.bind(this);
		this.valid = this.valid.bind(this);
	}

	handleSubmit(evt) {
		evt.preventDefault();
		if (!this.valid()) {
			return;
		}
		const area = this.area.getValue();
		const gender = this.gender.getValue();
		const title = this.title && this.title.getValue();
		const name = this.name.getValue().trim();
		const bio = this.bio.getValue().trim();

		const data = {
			areaId: area ? parseInt(area, 10) : null,
			bio,
			genderId: gender ? parseInt(gender, 10) : null,
			id: this.props.editor.id,
			name,
			title
		};

		request.post('/editor/edit/handler')
			.send(data)
			.then(() => {
				window.location.href = `/editor/${this.props.editor.id}`;
			});
	}

	valid() {
		return this.name.getValue();
	}

	render() {
		const loadingElement =
			this.state.waiting ? <LoadingSpinner/> : null;
		const genderOptions = this.state.genders.map((gender) => ({
			id: gender.id,
			name: gender.name
		}));
		const titleOptions = this.state.titles.map((unlock) => {
			const {title} = unlock;
			title.unlockId = unlock.id;
			return title;
		});

		const initialDisplayName = this.state.name;
		const initialGender = this.state.gender ? this.state.gender.id : null;
		const initialBio = this.state.bio;
		const initialArea = injectDefaultAliasName(this.state.area);

		return (
			<Grid>
				<h1>Edit Profile</h1>
				<Row>
					<Col md={12}>
						<p className="lead">Edit your public profile.</p>
					</Col>
				</Row>
				<Row>
					<Col
						id="profileForm"
						md={6}
						mdOffset={3}
					>
						<form
							className="form-horizontal"
							onSubmit={this.handleSubmit}
						>
							{loadingElement}
							<CustomInput
								defaultValue={initialDisplayName}
								label="Display Name"
								ref={(ref) => this.name = ref}
								type="text"
							/>
							<CustomInput
								defaultValue={initialBio}
								label="Bio"
								ref={(ref) => this.bio = ref}
								type="textarea"
							/>
							{titleOptions.length > 0 &&
								<SelectWrapper
									base={ReactSelect}
									idAttribute="unlockId"
									instanceId="title"
									label="Title"
									labelAttribute="title"
									options={titleOptions}
									placeholder="Select title"
									ref={(ref) => this.title = ref}
								/>
							}
							<SearchSelect
								defaultValue={initialArea}
								label="Area"
								placeholder="Select area..."
								ref={(ref) => this.area = ref}
								type="area"
							/>
							<SelectWrapper
								base={ReactSelect}
								defaultValue={initialGender}
								idAttribute="id"
								instanceId="gender"
								label="Gender"
								labelAttribute="name"
								options={genderOptions}
								placeholder="Select Gender"
								ref={(ref) => this.gender = ref}
							/>
							<div className="form-group text-center">
								<Button
									bsSize="large"
									bsStyle="primary"
									type="submit"
								>
									Update!
								</Button>
							</div>
						</form>
					</Col>
				</Row>
			</Grid>
		);
	}
}

ProfileForm.displayName = 'ProfileForm';
ProfileForm.propTypes = {
	editor: PropTypes.shape({
		area: validators.labeledProperty,
		bio: PropTypes.string,
		gender: PropTypes.shape({
			id: PropTypes.number
		}),
		id: PropTypes.number,
		name: PropTypes.string,
		titleUnlockId: PropTypes.number
	}).isRequired,
	genders: PropTypes.array.isRequired,
	titles: PropTypes.array.isRequired
};

export default ProfileForm;
