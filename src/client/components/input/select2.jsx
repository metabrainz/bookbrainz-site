/*
 * Copyright (C) 2015       Ben Ockmore
 *               2015-2016  Sean Burke
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
const _assign = require('lodash.assign');
const _isEqual = require('lodash.isequal');
const _omit = require('lodash.omit');

const Input = require('react-bootstrap').Input;

(() => {
	'use strict';

	let $ = null;
	if (typeof window !== 'undefined') {
		require('select2'); // eslint-disable-line global-require
		$ = window.$;
	}

	class Select extends React.Component {
		componentDidMount() {
			this.initSelect2();
		}

		shouldComponentUpdate(nextProps) {
			const nextPropsOmitOptions = _omit(nextProps, 'options');
			const currentPropsOmitOptions = _omit(this.props, 'options');
			if (!_isEqual(nextPropsOmitOptions, currentPropsOmitOptions)) {
				return true;
			}

			return Boolean(
				this.props.dynamicOptions &&
				!_isEqual(nextProps.options, this.props.options)
			);
		}

		componentWillUpdate() {
			this.disableOnChange();
		}

		componentDidUpdate() {
			this.initSelect2();
		}

		componentWillUnmount() {
			this.disableOnChange();
		}

		getValue() {
			return this.target.getValue();
		}

		initSelect2() {
			const mountElement = $(this.target.getInputDOMNode());

			// Copy the options object so we don't munge options for subsequent
			// selects
			const options = _assign({}, this.props.select2Options);
			options.theme = 'bootstrap';

			if (this.props.placeholder) {
				options.placeholder = this.props.placeholder;
			}

			// This retains previous behavior of not allowing multiple
			// selections to be cleared while making it easier to set defaults;
			// it could go away in future without hurting anyone's feelings
			if (this.props.multiple) {
				options.allowClear = false;
			}

			mountElement.select2(options);
			mountElement.on('change', this.props.onChange);
		}

		disableOnChange() {
			const select = $(this.target.getInputDOMNode());

			// Unregister onChange event, so that it isn't triggered while the
			// DOM is refreshed.
			select.off('change');
		}

		render() {
			let options = [];
			if (this.props.options) {
				options = this.props.options.map((op) =>
					<option
						key={op[this.props.idAttribute]}
						value={op[this.props.idAttribute]}
					>
						{op[this.props.labelAttribute]}
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
	}

	Select.displayName = 'Select2Input';
	Select.propTypes = {
		dynamicOptions: React.PropTypes.bool,
		idAttribute: React.PropTypes.string,
		labelAttribute: React.PropTypes.string,
		multiple: React.PropTypes.bool,
		options: React.PropTypes.array,
		placeholder: React.PropTypes.string,
		select2Options: React.PropTypes.object,
		onChange: React.PropTypes.func
	};
	Select.defaultProps = {
		dynamicOptions: false
	};

	module.exports = Select;
})();
