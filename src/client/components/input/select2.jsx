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

/* eslint global-require: 0, no-var: 0 */

const React = require('react');
const _assign = require('lodash.assign');
const _isEqual = require('lodash.isequal');
const _omit = require('lodash.omit');

const Input = require('react-bootstrap').Input;

var $ = null;
if (typeof window !== 'undefined') {
	require('select2');
	$ = window.$;
}

const Select = React.createClass({
	displayName: 'Select2Input',
	propTypes: {
		dynamicOptions: React.PropTypes.bool,
		multiple: React.PropTypes.bool,
		options: React.PropTypes.array,
		placeholder: React.PropTypes.string,
		select2Options: React.PropTypes.object,
		onChange: React.PropTypes.func
	},
	getDefaultProps() {
		'use strict';
		return {
			dynamicOptions: false
		};
	},
	componentDidMount() {
		'use strict';
		this.initSelect2();
	},
	shouldComponentUpdate(nextProps) {
		'use strict';
		const nextPropsWithoutOptions = _omit(nextProps, 'options');
		const currentPropsWithoutOptions = _omit(this.props, 'options');
		if (!_isEqual(nextPropsWithoutOptions, currentPropsWithoutOptions)) {
			return true;
		}

		const optionsChanged = (
			this.props.dynamicOptions &&
			!_isEqual(nextProps.options, this.props.options)
		);

		if (optionsChanged) {
			return true;
		}

		return false;
	},
	componentWillUpdate() {
		'use strict';
		var select = $(this.target.getInputDOMNode());
		select.off('change');
	},
	componentDidUpdate() {
		'use strict';
		this.initSelect2();
	},
	componentWillUnmount() {
		'use strict';

		const select = $(this.target.getInputDOMNode());

		// Unregister onChange event, so that it isn't triggered while the DOM
		// is refreshed.
		select.off('change');
	},
	getValue() {
		'use strict';

		return this.target.getValue();
	},
	initSelect2() {
		'use strict';

		const mountElement = $(this.target.getInputDOMNode());

		// Copy the options object so we don't munge options for subsequent
		// selects
		const options = _assign({}, this.props.select2Options);
		options.theme = 'bootstrap';

		if (this.props.placeholder) {
			options.placeholder = this.props.placeholder;
		}

		// This retains previous behavior of not allowing multiple selections
		// to be cleared while making it easier to set defaults; it could go
		// away in future without hurting anyone's feelings
		if (this.props.multiple) {
			options.allowClear = false;
		}

		mountElement.select2(options);
		mountElement.on('change', this.props.onChange);
	},
	render() {
		'use strict';

		const self = this;
		let options = [];
		if (this.props.options) {
			options = this.props.options.map((op) =>
				<option
					key={op[self.props.idAttribute]}
					value={op[self.props.idAttribute]}
				>
					{op[self.props.labelAttribute]}
				</option>
			);
		}

		if (this.props.placeholder) {
			options.unshift(<option key={0}/>);
		}

		return (
			<Input
				{...this.props}
				ref={(ref) => this.target = ref}
				type="select"
			>
				{options}
			</Input>
		);
	}
});

module.exports = Select;
