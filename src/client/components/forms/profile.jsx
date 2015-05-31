/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var LoadingSpinner = require('../loading_spinner.jsx');

var request = require('superagent');
require('superagent-bluebird-promise');

module.exports = React.createClass({
	getInitialState: function() {
		'use strict';

		return {
			id: this.props.id,
			email: this.props.email,
			bio: this.props.bio,
			waiting: false
		};
	},
	handleSubmit: function(e) {
		'use strict';

		e.preventDefault();

		var data = {
			id: this.state.id,
			email: this.refs.email.getValue().trim(),
			bio: this.refs.bio.getValue().trim()
		};

		this.setState({waiting: true});

		request.post('/editor/edit/handler')
			.send(data).promise()
			.then(function(user) {
				window.location.href = '/editor/' + user.body.user_id;
			});
	},
	render: function() {
		'use strict';

		var loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

		return <form className='form-horizontal' onSubmit={this.handleSubmit}>
			{loadingElement}
			<Input
				type='text'
				label='Email'
				ref='email'
				defaultValue={this.state.email}
				wrapperClassName='col-md-9'
				labelClassName='col-md-3' />
			<Input
				type='textarea'
				label='Bio'
				ref='bio'
				defaultValue={this.state.bio}
				wrapperClassName='col-md-9'
				labelClassName='col-md-3' />
			<div className='form-group'>
				<div className='col-md-4 col-md-offset-4'>
					<Button bsStyle='primary' bsSize='large' block type='submit'>Update!</Button>
				</div>
			</div>
		</form>;
	}
});
