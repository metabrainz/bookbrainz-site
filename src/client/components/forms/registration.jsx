/*
 * Copyright (C) 2015  Annie Zhou
 *               2016  Sean Burke
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

const LoadingSpinner = require('../loading-spinner.jsx');

(() => {
	'use strict';

	class RegistrationForm extends React.Component {
		constructor() {
			super();

			this.state = {
				error: null,
				password: '',
				passwordRepeat: '',
				waiting: false
			};

			this.handleSubmit = this.handleSubmit.bind(this);
			this.handlePasswordChange = this.handlePasswordChange.bind(this);
			this.handlePasswordRepeatChange =
				this.handlePasswordRepeatChange.bind(this);
		}

		handleSubmit(event) {
			event.preventDefault();

			const data = {
				username: this.username.getValue(),
				email: this.email.getValue(),
				password: this.password.getValue(),
				passwordRepeat: this.passwordRepeat.getValue()
			};

			this.setState({
				error: null,
				password: '',
				passwordRepeat: '',
				waiting: true
			});

			request.post('/register/handler')
				.send(data)
				.then(() => {
					window.location.href = '/';
				})
				.catch((res) => {
					const error = res.body.error;
					this.setState({
						error,
						waiting: false
					});
				});
		}

		handlePasswordChange(event) {
			this.setState({
				password: event.target.value
			});
		}

		handlePasswordRepeatChange(event) {
			this.setState({
				passwordRepeat: event.target.value
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

			return (
				<div className="row">
					{loadingComponent}
					<div className="col-md-6 col-md-offset-3">
						<form
							className="whole-page-form form-horizontal"
							onSubmit={this.handleSubmit}
						>
							<div className="form-group">
								<Input
									className="form-control"
									label="Username"
									labelClassName="col-md-2"
									placeholder="Username"
									ref={(ref) => this.username = ref}
									type="text"
									wrapperClassName="col-md-10"
								/>
							</div>
							<div className="form-group">
								<Input
									className="form-control"
									label="Email"
									labelClassName="col-md-2"
									placeholder="email@example.com"
									ref={(ref) => this.email = ref}
									type="email"
									wrapperClassName="col-md-10"
								/>
							</div>
							<div className="form-group">
								<Input
									className="form-control"
									label="Password"
									labelClassName="col-md-2"
									placeholder="Password"
									ref={(ref) => this.password = ref}
									type="password"
									value={this.state.password}
									wrapperClassName="col-md-10"
									onChange={this.handlePasswordChange}
								/>
							</div>
							<div className="form-group">
								<Input
									className="form-control"
									label="Repeat Password"
									labelClassName="col-md-2"
									placeholder="Password"
									ref={(ref) => this.passwordRepeat = ref}
									type="password"
									value={this.state.passwordRepeat}
									wrapperClassName="col-md-10"
									onChange={this.handlePasswordRepeatChange}
								/>
							</div>
							{errorComponent}
							<Button
								block
								bsSize="large"
								bsStyle="primary"
								type="submit"
							>
								Register
							</Button>
						</form>
					</div>
				</div>
			);
		}
	}

	RegistrationForm.displayName = 'RegistrationForm';

	module.exports = RegistrationForm;
})();
