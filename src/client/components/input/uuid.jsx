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

const uuid_re =
	/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/;

const UUIDInput = React.createClass({
	displayName: 'uuidInput',
	getInitialState: function() {
		'use strict';

		return {
			value: this.props.defaultValue,
			valid: true
		};
	},
	getValue: function() {
		'use strict';

		return this.state.value;
	},
	valid: function() {
		'use strict';

		return this.state.valid;
	},
	validationState: function() {
		'use strict';

		if (this.state.valid) {
			return 'success';
		}
		else {
			return 'error';
		}
	},
	handleChange: function(e) {
		'use strict';
		// This could also be done using ReactLink:
		// http://facebook.github.io/react/docs/two-way-binding-helpers.html

		let result = uuid_re.exec(this.refs.input.getValue());

		const valid = Boolean(result);
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
		'use strict';

		return (
			<Input
				bsStyle={this.validationState()}
				disabled={this.props.disabled}
				groupClassName={this.props.groupClassName}
				help={this.props.help}
				label={this.props.label}
				labelClassName={this.props.labelClassName}
				onChange={this.handleChange}
				placeholder={this.props.placeholder}
				ref="input"
				standalone={this.props.standalone}
				type="text"
				value={this.state.value}
				wrapperClassName={this.props.wrapperClassName}
			/>
		);
	}
});

module.exports = UUIDInput;
