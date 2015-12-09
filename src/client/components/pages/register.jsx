const React = require('react');
const PageHeader = require('react-bootstrap').PageHeader;

module.exports = React.createClass({
	displayName: 'RegistrationPage',
	render() {
		'use strict';

		return (
			<div className="row">
        <div className="col-md-6 col-md-offset-3">
          <form action="/register/handler" method="post" className="whole-page-form form-horizontal">
            <div className="form-group">
              <label htmlFor="registerUsername" className="col-md-2">Username</label>
              <div className="col-md-10">
                <input id="registerUsername" type="text" placeholder="Username" name="username" className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="registerEmail" className="col-md-2">Email</label>
              <div className="col-md-10">
                <input id="registerEmail" type="email" placeholder="email@example.com" name="email" className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword" className="col-md-2">Password</label>
              <div className="col-md-10">
                <input id="registerPassword" type="password" placeholder="Password" name="password" className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword2" className="col-md-2">Repeat Password</label>
              <div className="col-md-10">
                <input id="registerPassword2" type="password" placeholder="Password" name="password2" className="form-control" />
              </div>
            </div>
            <button type="submit" className="btn btn-success btn-lg btn-block">Register</button>
          </form>
        </div>
      </div>
    );
	}
});