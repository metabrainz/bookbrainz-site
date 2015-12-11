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