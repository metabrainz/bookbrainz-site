var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var LoadingSpinner = require('../loading_spinner.jsx');

var request = require('superagent');
require('superagent-bluebird-promise');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			id: this.props.id,
			email: this.props.email,
			bio: this.props.bio,
			waiting: false
		};
	},
	handleSubmit: function(e) {
		e.preventDefault();

		data = {
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
		if (this.state.waiting) {
			var loadingElement = <LoadingSpinner />;
		}

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
