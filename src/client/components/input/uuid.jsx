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

const uuidRegex =
	/[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}/;

const UUIDInput = React.createClass({
	displayName: 'uuidInput',
	propTypes: {
		defaultValue: React.PropTypes.string,
		disabled: React.PropTypes.bool,
		groupClassName: React.PropTypes.string,
		help: React.PropTypes.string,
		label: React.PropTypes.string,
		labelClassName: React.PropTypes.string,
		onChange: React.PropTypes.func,
		placeholder: React.PropTypes.string,
		standalone: React.PropTypes.bool,
		wrapperClassName: React.PropTypes.string
	},
	getInitialState() {
		'use strict';

		return {
			value: this.props.defaultValue,
			valid: true
		};
	},
	getValue() {
		'use strict';

		return this.state.value;
	},
	valid() {
		'use strict';

		return this.state.valid;
	},
	validationState() {
		'use strict';

		if (this.state.valid) {
			return 'success';
		}

		return 'error';
	},
	handleChange(evt) {
		'use strict';
		// This could also be done using ReactLink:
		// http://facebook.github.io/react/docs/two-way-binding-helpers.html

		let result = uuidRegex.exec(this.refs.input.getValue());

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
				valid
			},
			this.props.onChange ? this.props.onChange.bind(this, evt) : null
		);
	},
	render() {
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
