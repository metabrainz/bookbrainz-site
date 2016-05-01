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

const LoadingSpinner = require('../loading_spinner.jsx');

module.exports = React.createClass({
	displayName: 'LoginForm',
	getInitialState() {
		'use strict';

		return {
			error: null,
			password: '',
			waiting: false
		};
	},
	handleSubmit(event) {
		'use strict';

		event.preventDefault();

		const data = {
			username: this.username.getValue(),
			password: this.password.getValue()
		};

		this.setState({
			error: null,
			password: '',
			waiting: true
		});

		request.post('/login/handler')
			.send(data)
			.then((res) => {
				let redirectTo = '/';
				if (res.body && res.body.redirectTo) {
					redirectTo = res.body.redirectTo;
				}

				window.location.href = redirectTo;
			})
			.catch((res) => {
				const error = res.body.error;
				this.setState({
					error,
					waiting: false
				});
			});
	},
	handlePasswordChange(event) {
		'use strict';

		this.setState({
			password: event.target.value
		});
	},
	render() {
		'use strict';

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				(<Alert bsStyle="danger">{this.state.error}</Alert>);
		}

		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;

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
						{errorComponent}
						<Button
							block
							bsSize="large"
							bsStyle="primary"
							type="submit"
						>
							Log In
						</Button>
						<hr/>
						<Button
							block
							bsSize="large"
							href="/register"
						>
							Register
						</Button>
					</form>
				</div>
			</div>
		);
	}
});
