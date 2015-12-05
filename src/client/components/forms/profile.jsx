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

const React = require('react');

const Input = require('react-bootstrap').Input;
const Button = require('react-bootstrap').Button;
const LoadingSpinner = require('../loading_spinner.jsx');

const request = require('superagent');
require('superagent-bluebird-promise');

module.exports = React.createClass({
	displayName: 'profileForm',
	propTypes: {
		bio: React.PropTypes.string,
		id: React.PropTypes.number
	},
	getInitialState() {
		'use strict';

		return {
			id: this.props.id,
			bio: this.props.bio,
			waiting: false
		};
	},
	handleSubmit(evt) {
		'use strict';

		evt.preventDefault();

		const data = {
			id: this.state.id,
			bio: this.refs.bio.getValue().trim()
		};

		this.setState({waiting: true});

		request.post('/editor/edit/handler')
			.send(data).promise()
			.then((user) => {
				window.location.href = `/editor/${user.body.user_id}`;
			});
	},
	render() {
		'use strict';

		const loadingElement = this.state.waiting ? <LoadingSpinner/> : null;

		return (
			<form
				className="form-horizontal"
				onSubmit={this.handleSubmit}
			>
				{loadingElement}
				<Input
					defaultValue={this.state.bio}
					label="Bio"
					labelClassName="col-md-3"
					ref="bio"
					type="textarea"
					wrapperClassName="col-md-9"
				/>
				<div className="form-group">
					<div className="col-md-4 col-md-offset-4">
						<Button
							block
							bsSize="large"
							bsStyle="primary"
							type="submit"
						>
							Update!
						</Button>
					</div>
				</div>
			</form>
		);
	}
});
