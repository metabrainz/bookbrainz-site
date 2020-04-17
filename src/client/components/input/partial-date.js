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

import CustomInput from '../../input';
import PropTypes from 'prop-types';
import React from 'react';


const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
const ymRegex = /^\d{4}-\d{2}$/;
const yRegex = /^\d{4}$/;

/**
 * This class is derived from the React Component base class
 * to render a partial date (any of the formats "YYYY", "YYYY-MM",
 * "YYYY-MM-DD"). This allows the editor to be vague where information is not
 * known. It also checks validity of the value filled in the date field.
 */
class PartialDate extends React.Component {
	/**
	 * Function to check validity of the partial date.
	 * @param {string} value - Partial Date to be validated.
	 * @param {function} customValidator - custom validation function
	 * @returns {boolean} - True if the partial date value is null or if
	 * the partial date is valid.
	 */
	static validate(value, customValidator) {
		if (!value) {
			return true;
		}

		const validSyntax = Boolean(
			ymdRegex.test(value) ||
			ymRegex.test(value) ||
			yRegex.test(value)
		);
		const validValue = !isNaN(Date.parse(value));

		let passesCustomValidation = true;
		if (customValidator) {
			passesCustomValidation = Boolean(customValidator(value));
		}
		return validSyntax && validValue && passesCustomValidation;
	}

	/**
	 * Binds the class methods to their respective data.
	 * @constructor
	 * @param {object} props - Properties passed to the component.
	 */
	constructor(props) {
		super(props);

		this.state = {
			valid: PartialDate.validate(this.props.defaultValue),
			value: this.props.defaultValue
		};

		// React does not autobind non-React class methods
		this.handleChange = this.handleChange.bind(this);
	}

	/**
	 * To get the value filled in the form field.
	 * @returns {string} - Value filled in the form field.
	 */
	getValue() {
		return this.state.value;
	}

	/**
	 * An event handler, which is triggered whenever the value in the date field
	 * changes and then, it validates the PartialDate value and updates
	 * the component's state with the new value and validation state.
	 * It also triggers the onChange function if the validation state is true.
	 */
	handleChange() {
		const input = this.input.getValue().trim();

		if (input.length > 10) {
			return;
		}

		this.setState({
			valid: PartialDate.validate(input,
				this.props.customValidator),
			value: input
		});

		if (this.props.onChange) {
			this.props.onChange();
		}
	}

	/**
	 * Calls the date validator function of the 'PartialDate' class and the
	 * value filled in the date field is passed for validation.
	 * @returns {boolean} - The result as obtained from the date validator.
	 */
	valid() {
		return PartialDate.validate(this.input.getValue().trim(),
			this.props.customValidator);
	}

	/**
	 * Applies correct validationClass to the CSS of the field input, based on
	 * results obtained from the valid() function.
	 * @returns {string} validationClass - The validation class to be applied to
	 * the date field.
	 */
	validationState() {
		let validationClass = null;

		if (this.state.value) {
			validationClass = this.state.valid ? 'success' : 'error';
		}

		return validationClass;
	}

	/**
	 * Renders the PartialDate input field.
	 * @returns {ReactElement} - The rendered input field element.
	 */
	render() {
		return (
			<CustomInput
				bsStyle={this.validationState()}
				ref={(ref) => this.input = ref}
				type="text"
				value={this.state.value}
				onChange={this.handleChange}
				{...this.props}
			/>
		);
	}
}

PartialDate.displayName = 'PartialDate';
PartialDate.propTypes = {
	customValidator: PropTypes.func,
	defaultValue: PropTypes.string,
	groupClassName: PropTypes.string,
	help: PropTypes.string,
	label: PropTypes.string,
	labelClassName: PropTypes.string,
	onChange: PropTypes.func,
	placeholder: PropTypes.string,
	wrapperClassName: PropTypes.string
};
PartialDate.defaultProps = {
	customValidator: null,
	defaultValue: null,
	groupClassName: null,
	help: null,
	label: null,
	labelClassName: null,
	onChange: null,
	placeholder: null,
	wrapperClassName: null
};

export default PartialDate;
