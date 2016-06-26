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

const LoadingSpinner = require('../loading_spinner.jsx');

module.exports = React.createClass({
	displayName: 'RegistrationForm',
	getInitialState() {
		'use strict';

		return {
			error: null,
			password: '',
			passwordRepeat: '',
			waiting: false
		};
	},
	handleSubmit(event) {
		'use strict';

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
	},
	handlePasswordChange(event) {
		'use strict';

		this.setState({
			password: event.target.value
		});
	},
	handlePasswordRepeatChange(event) {
		'use strict';

		this.setState({
			passwordRepeat: event.target.value
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
			<div>
				<PageHeader>Register</PageHeader>
				<p>
					To sign up as an editor of BookBrainz, you need to first have a
					MusicBrainz account. Please click the button below to sign in or
					register with MusicBrainz. You'll then be redirected back to
					BookBrainz to continue registration!
				</p>
				<div className="text-center">
					<Button
						href="/auth"
						type="submit"
					>
						<img
							className="margin-right-0-5"
							src="/images/MusicBrainz_logo_icon.svg"
						/>
						Sign In or Register with MusicBrainz
					</Button>
				</div>
			</div>
		);
	}
});
