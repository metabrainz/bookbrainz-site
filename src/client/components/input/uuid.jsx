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

var uuid_re =
	/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/;

var UUIDInput = React.createClass({
	getInitialState: function() {
		return {
			value: this.props.defaultValue,
			valid: true
		};
	},
	getValue: function() {
		return this.state.value;
	},
	valid: function() {
		return this.state.valid;
	},
	validationState: function() {
		if (this.state.valid) {
			return 'success';
		}
		else {
			return 'error';
		}
	},
	handleChange: function(e) {
		// This could also be done using ReactLink:
		// http://facebook.github.io/react/docs/two-way-binding-helpers.html

		var result = uuid_re.exec(this.refs.input.getValue());

		var valid = Boolean(result);
		if (valid) {
			result = result[0];
		}
		else {
			result = this.refs.input.getValue();
		}

		this.setState(
			{
				value: result,
				valid: valid
			},
			this.props.onChange ? this.props.onChange.bind(this, e) : null
		);
	},
	render: function() {
		return (
			<Input
				type='text'
				value={this.state.value}
				placeholder={this.props.placeholder}
				label={this.props.label}
				help={this.props.help}
				bsStyle={this.validationState()}
				ref='input'
				groupClassName={this.props.groupClassName}
				wrapperClassName={this.props.wrapperClassName}
				labelClassName={this.props.labelClassName}
				onChange={this.handleChange}
				disabled={this.props.disabled}
				standalone={this.props.standalone} />
		);
	}
});

module.exports = UUIDInput;
