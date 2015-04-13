var React = require('react');

var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var UUIDInput = require('../input/uuid.jsx');
var Select = require('../input/select.jsx');
var LoadingSpinner = require('../loading_spinner.jsx');

var request = require('superagent'); require('superagent-bluebird-promise');


module.exports = React.createClass({
  getInitialState: function() {
    return {
      loading: true,
      waiting: false
    };
  },
  handleSubmit: function(e) {
    e.preventDefault();

    data = {
      id: this.state.id,
      name: this.refs.name.getValue().trim(),
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
  componentDidMount: function() {
    var self = this;
    request.get('/editor/edit/data').promise()
    	.then(function(response) {
        var user = response.body;
        self.setState({
          loading: false,
          id: user.user_id,
          form: {
            name: user.name,
            bio: user.bio,
            email: user.email
          }
        });
    	});
  },
  render: function() {
    if(this.state.loading) {
      return (<LoadingSpinner />);
    } else {
      if(this.state.waiting) {
        var loadingElement = <LoadingSpinner />;
      }

      return (
        <form className='form-horizontal' onSubmit={this.handleSubmit}>
          {loadingElement}
          <Input
            type='text'
            label='Name'
            ref='name'
            defaultValue={this.state.form.name}
            wrapperClassName='col-md-9'
            labelClassName='col-md-3' />
          <Input
            type='text'
            label='Email'
            ref='email'
            defaultValue={this.state.form.email}
            wrapperClassName='col-md-9'
            labelClassName='col-md-3' />
          <Input
            type='textarea'
            label='Bio'
            ref='bio'
            defaultValue={this.state.form.bio}
            wrapperClassName='col-md-9'
            labelClassName='col-md-3' />
          <div className='form-group'>
            <div className='col-md-4 col-md-offset-4'>
              <Button bsStyle='primary' bsSize='large' block type="submit">Update!</Button>
            </div>
          </div>
        </form>
      );
    }
  }
});
