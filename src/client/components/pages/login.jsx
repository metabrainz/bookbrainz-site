const React = require('react');

module.exports = React.createClass({
	displayName: 'LoginPage',
	render() {
		'use strict';

		return (
			<div className="row">
        <div className="col-md-6 col-md-offset-3">
          <form action="/login/handler" method="post" className="whole-page-form form-horizontal">
            <div className="form-group">
              <label htmlFor="loginUsername" className="col-md-2">Username</label>
              <div className="col-md-10">
                <input id="loginUsername" type="text" placeholder="Username" name="username" className="form-control" />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword" className="col-md-2">Password</label>
              <div className="col-md-10">
                <input id="loginPassword" type="password" placeholder="Password" name="password" className="form-control" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block">Login</button>
            <hr /><a href="/register" className="btn btn-success btn-lg btn-block">Register</a>
          </form>
        </div>
      </div>
    );
	}
});