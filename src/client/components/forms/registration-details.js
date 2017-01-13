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
const React = require('react');
const request = require('superagent-bluebird-promise');

const Alert = require('react-bootstrap').Alert;
const Button = require('react-bootstrap').Button;
const Input = require('react-bootstrap').Input;
const PageHeader = require('react-bootstrap').PageHeader;
const Select = require('../input/select2');
const PartialDate = require('../input/partial-date');

const LoadingSpinner = require('../loading-spinner');
const validators = require('../../helpers/react-validators');
const isValidUserBirthday =
	require('../../helpers/utils').isValidUserBirthday;

class RegistrationForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			waiting: false,
			valid: this.isValid()
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		const gender = this.gender.getValue();
		const birthday = this.birthday.getValue();
		const data = {
			displayName: this.displayName.getValue(),
			gender: gender ? parseInt(gender, 10) : null,
			birthday: birthday || null
		};

		this.setState({
			error: null,
			waiting: true
		});

		request.post('/register/handler')
			.send(data)
			.then(() => {
				window.location.href = '/login';
			})
			.catch((res) => {
				const error = res.body.error;
				this.setState({
					error,
					waiting: false
				});
			});
	}

	isValid() {
		const displayNameValid =
			!this.displayName || this.displayName.getValue().length > 0;
		const birthdayValid = !this.birthday || this.birthday.valid();

		return displayNameValid && birthdayValid;
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
				(<Alert bsStyle="danger">{this.state.error}</Alert>);
		}

		const loadingComponent = this.state.waiting ?
			<LoadingSpinner/> : null;

		const initialGender = this.props.gender && this.props.gender.id;
		const select2Options = {
			allowClear: true,
			width: '100%'
		};

		return (
			<div>
				<PageHeader>Register</PageHeader>
				<div>
					Great! You successfully logged in to MusicBrainz and
					are now just one step away from becoming a BookBrainz
					editor. The following form allows you to specify
					additional information that will let other users know
					a little bit more about you. When you're done, just
					click the green button at the bottom of the page.
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
							<Input
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
								And, optionally, set a gender and birthday
								that will be displayed on your profile
								page.
							</p>
							<Select
								noDefault
								defaultValue={initialGender}
								idAttribute="id"
								label="Gender"
								labelAttribute="name"
								labelClassName="col-md-4"
								options={this.props.genders}
								placeholder="Select gender…"
								ref={(ref) => this.gender = ref}
								select2Options={select2Options}
								wrapperClassName="col-md-4"
							/>
							<PartialDate
								customValidator={isValidUserBirthday}
								label="Birthday"
								labelClassName="col-md-4"
								placeholder="YYYY-MM-DD"
								ref={(ref) => this.birthday = ref}
								wrapperClassName="col-md-4"
								onChange={this.handleChange}
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
	gender: validators.namedProperty,
	genders: React.PropTypes.arrayOf(validators.namedProperty),
	name: React.PropTypes.string
};

module.exports = RegistrationForm;
