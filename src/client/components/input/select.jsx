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
var $ = require('jquery');

if (typeof window !== 'undefined') {
	window.$ = $;
	require('select2');
}

var Select = React.createClass({
	getValue: function() {
		'use strict';

		return this.refs.input.getValue();
	},
	handleChange: function() {
		'use strict';

		if (this.props.onChange) {
			this.props.onChange();
		}
	},
	componentDidMount: function() {
		'use strict';

		var select2Options = this.props.select2Options || {};
		var self = this;

		/* Allow consistent behavior with other bootstrap components, but don't
		 * clobber select2 options otherwise. */
		if (this.props.placeholder) {
			select2Options.placeholder = this.props.placeholder;
		}

		/* Don't set allowClear if there's no placeholder. It gets ugly. */
		if (this.allowClear && select2Options.placeholder) {
			select2Options.allowClear = true;
		}

		$(this.refs.input.getInputDOMNode()).select2(select2Options);

		$(this.refs.input.getInputDOMNode()).on('select2:select', function(e) { self.handleChange(); });
		$(this.refs.input.getInputDOMNode()).on('select2:unselect', function(e) { self.handleChange(); });
	},
	componentDidUpdate: function() {
		'use strict';

		var select2Options = this.props.select2Options || {};
		var self = this;

		/* Allow consistent behavior with other bootstrap components, but don't
		 * clobber select2 options otherwise. */
		if (this.props.placeholder) {
			select2Options.placeholder = this.props.placeholder;
		}

		/* Don't set allowClear if there's no placeholder. It gets ugly. */
		if (this.allowClear && select2Options.placeholder) {
			select2Options.allowClear = true;
		}

		$(this.refs.input.getInputDOMNode()).select2(select2Options);

		$(this.refs.input.getInputDOMNode()).on('select2:select', function(e) { self.handleChange(); });
		$(this.refs.input.getInputDOMNode()).on('select2:unselect', function(e) { self.handleChange(); });
	},
	render: function() {
		'use strict';

		var self = this;
		var options = [];
		if (this.props.options) {
			options = this.props.options.map(function(op) {
				return (
					<option key={op[self.props.idAttribute]} value={op[self.props.idAttribute]}>
						{op[self.props.labelAttribute]}
					</option>
				);
			});
		}

		if (this.props.noDefault) {
			options.unshift(<option key='0'></option>);

			/* Setting allow clear is unnecessary if this is a multiselect. */
			if (!this.props.multiple) {
				this.allowClear = true;
			}
		}

		return (
			<Input
				type='select'
				placeholder={this.props.placeholder}
				value={this.props.value}
				defaultValue={this.props.defaultValue}
				disabled={this.props.disabled}
				label={this.props.label}
				help={this.props.help}
				bsStyle={this.props.bsStyle}
				ref='input'
				groupClassName={this.props.groupClassName}
				wrapperClassName={this.props.wrapperClassName}
				labelClassName={this.props.labelClassName}
				multiple={this.props.multiple}
				onChange={this.handleChange}
				standalone={this.props.standalone}>
				{options}
			</Input>
		);
	}
});

module.exports = Select;
