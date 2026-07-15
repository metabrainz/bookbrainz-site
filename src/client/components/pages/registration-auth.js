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
import PropTypes from 'prop-types';
import React from 'react';
import {hot} from 'react-hot-loader';


const {Alert, Button, Col, Form, Row} = bootstrap;

/**
 * Renders a page allowing the user to sign in to MusicBrainz to
 * continue the BookBrainz registration process.
 * @returns {ReactElement} an element containing the rendered output.
 */
function RegistrationAuth({email, error, signUpDisabled, username}) {
	const errorComponent = error ?
		<Alert variant="danger">{error}</Alert> : null;
	return (
		<div>
			<div className="page-header"><h1>Register</h1></div>
			<p>
				To sign up as an editor of BookBrainz, start by creating
				or signing in to a MetaBrainz account. BookBrainz will send
				you to MetaBrainz and bring you back to your BookBrainz
				profile.
			</p>
			{errorComponent}
			<Row>
				<Col lg={{span: 6}}>
					<h2>Create a MetaBrainz account</h2>
					<Form
						action="/register/metabrainz-request"
						method="post"
					>
						<Form.Group>
							<Form.Label>MetaBrainz username</Form.Label>
							<Form.Control
								required
								defaultValue={username}
								disabled={signUpDisabled}
								name="username"
								type="text"
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>Email address</Form.Label>
							<Form.Control
								required
								defaultValue={email}
								disabled={signUpDisabled}
								name="email"
								type="email"
							/>
						</Form.Group>
						<Button
							disabled={signUpDisabled}
							type="submit"
							variant="primary"
						>
							Continue to MetaBrainz
						</Button>
					</Form>
				</Col>
				<Col lg={{span: 6}}>
					<h2>Already have a MetaBrainz account?</h2>
					<p>
						Sign in with MetaBrainz to create or open your
						BookBrainz editor profile.
					</p>
					<Button
						disabled={signUpDisabled}
						href="/auth"
						type="submit"
					>
						<img
							alt="MusicBrainz"
							className="margin-right-0-5"
							src="/images/MusicBrainz_logo_icon.svg"
						/>
						Sign in with MetaBrainz
					</Button>
				</Col>
			</Row>
		</div>
	);
}

RegistrationAuth.displayName = 'RegistrationForm';
RegistrationAuth.propTypes = {
	email: PropTypes.string,
	error: PropTypes.string,
	signUpDisabled: PropTypes.bool,
	username: PropTypes.string
};
RegistrationAuth.defaultProps = {
	email: '',
	error: null,
	signUpDisabled: false,
	username: ''
};

// Export as hot module (see https://github.com/gaearon/react-hot-loader)
export default hot(module)(RegistrationAuth);
