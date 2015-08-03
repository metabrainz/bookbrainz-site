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

var ymd_re = /^\d{4}-\d{2}-\d{2}$/;
var ym_re = /^\d{4}-\d{2}$/;
var y_re = /^\d{4}$/;

var PartialDate = React.createClass({
	getValue: function() {
		'use strict';

		return this.state.value;
	},
	getInitialState: function() {
		'use strict';

		return {
			value: this.props.defaultValue,
			valid: this.validate(this.props.defaultValue)
		};
	},
	validate: function(value) {
		'use strict';

		if (!value) {
			return true;
		}
		else {
			var validSyntax = Boolean(ymd_re.test(value) || ym_re.test(value) ||
			                          y_re.test(value));
			var validValue = !isNaN(Date.parse(value));
			return validSyntax && validValue;
		}
	},
	handleChange: function() {
		'use strict';

		var input = this.refs.input.getValue().trim();

		if (input.length > 10) {
			return;
		}

		this.setState({
			value: input,
			valid: this.validate(input)
		});
	},
	valid: function() {
		'use strict';

		return this.state.valid;
	},
	validationState: function() {
		'use strict';

		var validationClass = null;

		if (this.state.value) {
			validationClass = this.state.valid ? 'success' : 'error';
		}

		return validationClass;
	},
	render: function() {
		'use strict';

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
				onChange={this.handleChange} />
		);
	}
});


module.exports = PartialDate;
