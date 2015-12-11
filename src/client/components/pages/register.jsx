/*
 * Copyright (C) 2015  Annie Zhou
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
const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;

module.exports = React.createClass({
	displayName: 'RegistrationPage',
	render() {
		'use strict';

		return (
			<div className="row">
				<div className="col-md-6 col-md-offset-3">
					<form action="/register/handler" className="whole-page-form form-horizontal" method="post">
					<div className="form-group">
						<Input className="form-control" id="registerUsername" label="Username" labelClassName="col-md-2" name="username" placeholder="Username" type="text" wrapperClassName="col-md-10" />
					</div>
					<div className="form-group">
						<Input className="form-control" id="registerEmail" label="Email" labelClassName="col-md-2" name="email" placeholder="email@example.com" type="email" wrapperClassName="col-md-10" />
					</div>
					<div className="form-group">
						<Input className="form-control" id="registerPassword" label="Password" labelClassName="col-md-2" name="password" placeholder="Password" type="password" wrapperClassName="col-md-10" />
					</div>
					<div className="form-group">
						<Input className="form-control" id="registerPassword2" label="Repeat Password" labelClassName="col-md-2" name="password2" placeholder="Password" type="password" wrapperClassName="col-md-10" />
					</div>
				<Button block bsSize="large" bsStyle="success" type="submit">Register</Button>
				</form>
			</div>
		</div>
		);
	}
});
