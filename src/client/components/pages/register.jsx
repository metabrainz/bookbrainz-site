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
          			<form action="/register/handler" method="post" className="whole-page-form form-horizontal">
            			<div className="form-group">
              
                		<Input id="registerUsername" label="Username" labelClassName="col-md-2" wrapperClassName="col-md-10" type="text" placeholder="Username" name="username" className="form-control" />
              
            			</div>
            		<div className="form-group">
                		<Input id="registerEmail" label="Email" labelClassName="col-md-2" wrapperClassName="col-md-10" type="email" placeholder="email@example.com" name="email" className="form-control" />
          
            		</div>
            		<div className="form-group">
                		<Input id="registerPassword" label="Password" labelClassName="col-md-2" wrapperClassName="col-md-10" type="password" placeholder="Password" name="password" className="form-control" />

            		</div>
            		<div className="form-group">

                		<Input id="registerPassword2" label="Repeat Password" labelClassName="col-md-2" wrapperClassName="col-md-10" type="password" placeholder="Password" name="password2" className="form-control" />
              
            		</div>	
            	<Button type="submit" bsStyle="success" bsSize="large" block>Register</Button>
          		</form>
        	</div>
      	</div>
    	);
	}
});