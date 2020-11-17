/*
 * Copyright (C) 2015  Annie Zhou
 *               2016  Sean Burke
 *               2016  Ben Ockmore
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
import * as validators from '../../helpers/react-validators';
import CustomInput from '../../input';
import LoadingSpinner from '../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import ReactSelect from 'react-select';
import SelectWrapper from '../input/select-wrapper';
import request from 'superagent';


const {Alert, Button, PageHeader} = bootstrap;

class RegistrationForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			valid: this.isValid(),
			waiting: false
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		const gender = this.gender.getValue();
		const data = {
			displayName: this.displayName.getValue(),
			gender: gender ? parseInt(gender, 10) : null
		};

		this.setState({
			error: null,
			waiting: true
		});

		request.post('/register/handler')
			.send(data)
			.then(() => {
				window.location.href = '/auth';
			})
			.catch((res) => {
				const {error} = res.body;
				this.setState({
					error,
					waiting: false
				});
			});
	}

	isValid() {
		return !this.displayName || this.displayName.getValue().length > 0;
	}

	handleChange() {
		this.setState({
			valid: this.isValid()
		});
	}

	render() {
		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;

		const initialGender = this.props.gender && this.props.gender.id;

		return (
			<div>
				<PageHeader>Register</PageHeader>
				<div>
					Great! You successfully logged in to MusicBrainz and
					are now just one step away from becoming a BookBrainz
					editor. The following form allows you to specify
					additional information that will let other users know
					a little bit more about you. When you’re done, just
					click the blue button at the bottom of the page.
				</div>
				<div className="row">
					{loadingComponent}
					<div className="col-md-6 col-md-offset-3">
						<form
							className="whole-page-form form-horizontal"
							onSubmit={this.handleSubmit}
						>
							<p>
								Firstly, please check that your display
								name is correct. This is the name that
								other editors will get to know you by.
							</p>
							<CustomInput
								className="form-control"
								defaultValue={this.props.name}
								label="Display Name"
								labelClassName="col-md-4"
								placeholder="Display Name"
								ref={(ref) => this.displayName = ref}
								type="text"
								wrapperClassName="col-md-4"
								onChange={this.handleChange}
							/>
							<p>
								And, optionally, set a gender
								that will be displayed on your profile
								page.
							</p>
							<SelectWrapper
								base={ReactSelect}
								defaultValue={initialGender}
								idAttribute="id"
								instanceId="gender"
								label="Gender"
								labelAttribute="name"
								labelClassName="col-md-4"
								options={this.props.genders}
								placeholder="Select gender…"
								ref={(ref) => this.gender = ref}
								wrapperClassName="col-md-4"
							/>
							<hr/>
							{errorComponent}
							<div className="text-center">
								<Button
									bsSize="large"
									bsStyle="primary"
									disabled={!this.state.valid}
									type="submit"
								>
									Looks good, sign me up!
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

RegistrationForm.displayName = 'RegistrationForm';
RegistrationForm.propTypes = {
	gender: validators.namedProperty, // eslint-disable-line react/no-typos
	genders: PropTypes.arrayOf(validators.namedProperty).isRequired,
	name: PropTypes.string
};
RegistrationForm.defaultProps = {
	gender: null,
	name: null
};

export default RegistrationForm;
