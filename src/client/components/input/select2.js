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
/* eslint valid-jsdoc: ["error", { "requireReturn": false }] */

import * as bootstrap from 'react-bootstrap';
import React from 'react';
import _assign from 'lodash.assign';
import _isEqual from 'lodash.isequal';
import _omit from 'lodash.omit';


const {Input} = bootstrap;

let $ = null;
if (typeof window !== 'undefined') {
	require('select2'); // eslint-disable-line global-require
	$ = window.$;
}

class Select extends React.Component {
	/**
	 * Initializes select input element
	 */
	componentDidMount() {
		this.initSelect2();
	}

	/**
	 * Used by React to determine if component should be re-rendered.
	 *
	 * @param {object} nextProps - Props object that is being received.
	 * @returns {boolean} - Component will be re-rendered if true.
	 */
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

	/**
	 * Prevents input change events from being dispatched to handlers.
	 */
	componentWillUpdate() {
		this.disableOnChange();
	}

	/**
	 * Re-initializes input element with change handlers.
	 */
	componentDidUpdate() {
		this.initSelect2();
	}

	/**
	 * Removes input change handlers.
	 */
	componentWillUnmount() {
		this.disableOnChange();
	}

	/**
	 * Extracts selected option from input.
	 *
	 * @returns {string} - Value of selected option.
	 */
	getValue() {
		return this.target.getValue();
	}

	/**
	 * Initializes select2 input with library options and attaches an input
	 * change handler.
	 */
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

	/**
	 * Removes the input change handlers.
	 */
	disableOnChange() {
		const select = $(this.target.getInputDOMNode());

		// Unregister onChange event, so that it isn't triggered while the
		// DOM is refreshed.
		select.off('change');
	}

	/**
	 * Used by React to render the component: A select input that allows users
	 * to select from a list of supplied options.
	 *
	 * @returns {object} - JSX to render.
	 */
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
	idAttribute: React.PropTypes.string.isRequired,
	labelAttribute: React.PropTypes.string.isRequired,
	multiple: React.PropTypes.bool,
	onChange: React.PropTypes.func,
	options: React.PropTypes.array,
	placeholder: React.PropTypes.string,
	select2Options: React.PropTypes.object
};
Select.defaultProps = {
	dynamicOptions: false,
	multiple: false,
	onChange: null,
	options: null,
	placeholder: null,
	select2Options: null
};

export default Select;
