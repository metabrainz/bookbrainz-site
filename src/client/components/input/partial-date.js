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

const Input = require('react-bootstrap').Input;

const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
const ymRegex = /^\d{4}-\d{2}$/;
const yRegex = /^\d{4}$/;

/**
* This class is derived from the React Component base class
* to render the date field and check validity of the value filled in it.
*/
class PartialDate extends React.Component {
	/**
	* Function to check validity of the date filled in the field.
	* @param {string} value - Date filled in field is passed in the validator.
	* @returns {boolean} - Returns true either if no data is filled in the field
	* or is the date filled in the field is valid.
	*/
	static validate(value) {
		if (!value) {
			return true;
		}

		const validSyntax = Boolean(
			ymdRegex.test(value) ||
			ymRegex.test(value) ||
			yRegex.test(value)
		);
		const validValue = !isNaN(Date.parse(value));

		return validSyntax && validValue;
	}

	/**
	* Binds the class methods to their respective data.
	* @constructor
	* @param {object} props - Properties passed to the component.
	*/
	constructor(props) {
		super(props);

		this.state = {
			value: this.props.defaultValue,
			valid: PartialDate.validate(this.props.defaultValue)
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
	* Track the changes in the date field of the form and validate the value in
	* the field after each change.
	*/
	handleChange() {
		const input = this.input.getValue().trim();

		if (input.length > 10) {
			return;
		}

		this.setState({
			value: input,
			valid: PartialDate.validate(input)
		});

		if (this.props.onChange) {
			this.props.onChange();
		}
	}

	/**
	* Calls the date validator function of the 'PartialDate' class.
	* @returns {boolean} - The result as obtained from the date validator.
	*/
	valid() {
		return PartialDate.validate(this.input.getValue().trim());
	}

	/**
	* Checks that whether the editor has succesfully filled the date field in
	* the form or not based on results by valid() function which checks the date
	* filled is valid or not.
	* @returns {string} validationClass - State of the date field in the form.
	*/
	validationState() {
		let validationClass = null;

		if (this.state.value) {
			validationClass = this.state.valid ? 'success' : 'error';
		}

		return validationClass;
	}

	/**
	* Renders the date input field in the form.
	* @returns {ReactElement} - A HTMl field in the form.
	*/
	render() {
		return (
			<Input
				bsStyle={this.validationState()}
				groupClassName={this.props.groupClassName}
				help={this.props.help}
				label={this.props.label}
				labelClassName={this.props.labelClassName}
				placeholder={this.props.placeholder}
				ref={(ref) => this.input = ref}
				type="text"
				value={this.state.value}
				wrapperClassName={this.props.wrapperClassName}
				onChange={this.handleChange}
			/>
		);
	}
}

PartialDate.displayName = 'PartialDate';
PartialDate.propTypes = {
	defaultValue: React.PropTypes.string,
	groupClassName: React.PropTypes.string,
	help: React.PropTypes.string,
	label: React.PropTypes.string,
	labelClassName: React.PropTypes.string,
	placeholder: React.PropTypes.string,
	wrapperClassName: React.PropTypes.string,
	onChange: React.PropTypes.func
};

module.exports = PartialDate;
