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

const Input = require('react-bootstrap').Input;
const React = require('react');

let $ = null;
if (typeof window !== 'undefined') {
	require('Select2');
	$ = window.$;
}

const Select = React.createClass({
	displayName: 'select2Input',
	componentDidMount: function() {
		'use strict';
		this.initSelect2();
	},
	componentDidUpdate: function() {
		'use strict';
		this.initSelect2();
	},
	componentWillUnmount: function() {
		'use strict';

		const select = $(this.refs.target.getInputDOMNode());

		// Unregister onChange event, so that it isn't triggered while the DOM is
		// refreshed.
		select.off('change');
	},
	getValue: function() {
		'use strict';

		return this.refs.target.getValue();
	},
	initSelect2: function() {
		'use strict';

		const mountElement = $(this.refs.target.getInputDOMNode());

		const options = this.props.select2Options || {};
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
	render: function() {
		'use strict';

		const self = this;
		let options = [];
		if (this.props.options) {
			options = this.props.options.map(function(op) {
				return (
					<option
						key={op[self.props.idAttribute]}
						value={op[self.props.idAttribute]}
					>
						{op[self.props.labelAttribute]}
					</option>
				);
			});
		}

		if (this.props.placeholder) {
			options.unshift(<option key={0}/>);
		}

		return (
			<Input
				{...this.props}
				ref="target"
				type="select"
			>
				{options}
			</Input>
		);
	}
});

module.exports = Select;
