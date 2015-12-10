const React = require('react');
const Input = require('react-bootstrap').Input;

const Button = require('react-bootstrap').Button;

module.exports = React.createClass({
	displayName: 'LoginPage',
	render() {
		'use strict';

		return (
			<div className="row">
				<div className="col-md-6 col-md-offset-3">
          			<form action="/login/handler" method="post" className="whole-page-form form-horizontal">
            			<div className="form-group">        
			                <Input id="loginUsername" label="Username" labelClassName="col-md-2" wrapperClassName="col-md-10" type="text" placeholder="Username" name="username" className="form-control" />
            			</div>
            			<div className="form-group">
                			<Input id="loginPassword" label="Password" labelClassName="col-md-2" wrapperClassName="col-md-10" type="password" placeholder="Password" name="password" className="form-control" />
              
            			</div>
            			<Button type="submit" bsStyle="primary" bsSize="large" block>
            				Login
            			</Button>
            			<hr />
            			<Button href="/register" bsStyle="success" bsSize="large" block>
            				Register
            			</Button>
          			</form>
        		</div>
      		</div>
    	);
	}
});