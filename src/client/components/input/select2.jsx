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

var Input = require('react-bootstrap').Input;
var React = require('react');

if (typeof window !== 'undefined') {
	require('Select2');
	var $ = window.$;
}

var Select = React.createClass({
	initSelect2: function() {
		'use strict';

		var mountElement = $(this.refs.target.getInputDOMNode());

		var options = this.props.select2Options || {};
		options.theme = 'bootstrap';

		if (this.props.placeholder) {
			options.placeholder = this.props.placeholder;
			if (!this.props.multiple) {
				options.allowClear = true;
			}
		}

		mountElement.select2(options);
		mountElement.on('change', this.props.onChange);
	},
	getValue: function() {
		'use strict';

		return this.refs.target.getValue();
	},
	componentWillUnmount: function() {
		'use strict';

		var select = $(this.refs.target.getInputDOMNode());

		// Unregister onChange event, so that it isn't triggered while the DOM is
		// refreshed.
		select.off('change');
	},
	componentDidMount: function() {
		'use strict';
		this.initSelect2();
	},
	componentWillUpdate: function() {
		'use strict';
		var select = $(this.refs.target.getInputDOMNode());
		select.off('change');
	},
	componentDidUpdate: function() {
		'use strict';
		this.initSelect2();
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

		if (this.props.placeholder) {
			options.unshift(<option key={0}/>);
		}

		return (
			<Input {...this.props} ref='target' type='select'>
				{options}
			</Input>
		);
	}
});

module.exports = Select;
