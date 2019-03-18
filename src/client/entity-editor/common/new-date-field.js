/* eslint-disable */

import CustomInput from '../../input';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from './validation-label';
import classNames from 'classnames';


class DateField extends React.Component {
	constructor(props) {
		super(props);
		let initialDate = props.defaultValue ? props.defaultValue.split('-') : [];
		const initialYear = initialDate.length > 0 ? initialDate[0] : '';
		const initialMonth = initialDate.length > 1 ? initialDate[1] : '';
		const initialDay = initialDate.length > 2 ? initialDate[2] : '';
		this.state = {
			day: initialDay,
			errorMessage: '',
			month: initialMonth,
			validDate: true,
			year: initialYear
		};
	}

	validateYear = (year) => {
		//console.log((this.state.month === '' || this.state.day === ''));
		if (year === '') {
			if (this.state.month === '' && this.state.day === '') {
				return true;
			}
			console.log('year empty and month or day not');
			this.setState({errorMessage: 'Year must be entered'});
			return false;
		}

		let isPositiveInt = /^\+?([0-9]\d*)$/.test(year) && year > 0;
		let isMonthDayValid = this.validateMonth(this.state.month, year) && this.validateDay(this.state.day, this.state.month, year);
		console.log('Is positive int '+ isPositiveInt);
		console.log('Is month and dat is valid ' + isMonthDayValid);
		if (!isPositiveInt) {
			this.setState({errorMessage: 'Year is not valid entry'});
			return false;
		}
		else if (!isMonthDayValid) {
			return false;
		}
		return true;
	};

	validateMonth = (month, year) => {
		const isPositiveInt = /^\+?([0-9]\d*)$/.test(month) && month > 0;
		console.log('month isPositiveInt ' + isPositiveInt);

		if (month === '') {
			console.log('empty month input');
			if (this.state.day === '') {
				return true;
			}
			this.setState({errorMessage: 'Month must be entered'});
			return false;
		}
		else if (!isPositiveInt) {
			this.setState({errorMessage: 'Month is not valid entry'});
			return false;
		}
		let isValidDate = this.validateDay(this.state.day, month, year);
		console.log('isValid date ' + isValidDate);
		if (!isValidDate) {
			return false;
		}
		else if (year === '') {
			this.setState({errorMessage: 'Year must be entered'});
			return false;
		}
		else if (month < 1 || month > 12) {
			console.log(' month valid');
			this.setState({errorMessage: 'Month is not valid entry'});
			return false;
		}
		return true;
	}

	validateDay = (day, month, year) => {
		let isPositiveInt = /^\+?([0-9]\d*)$/.test(day) && day > 0;
		if (day === '') {
			return true;
		}
		else if (!isPositiveInt) {
			this.setState({errorMessage: 'Day is not valid entry'});
			return false;
		}
		else if (year === '' ) {
			this.setState({errorMessage: 'Year must be entered'});
			return false;
		}
		else if (month === '') {
			this.setState({errorMessage: 'Month must be entered'});
			return false;
		}
		else if (day < 1 || day > 31) {
			this.setState({errorMessage: 'Day is not valid entry'});
			return false;
		}
		else if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31) {
			this.setState({errorMessage: 'Entered month has only 30 days'});
			return false;
		}
		else if ( month == 2) {
			let isleap = (year % 100 == 0) ? (year % 400 == 0) : (year % 4 == 0);
			console.log(' year is ' + year);
			console.log('is leap year ' + isleap );
			if (day < 1 || day > 29) {
				this.setState({errorMessage: 'Day is not valid entry for entered month'});
				return false;
			}
			else if (day > 29 || (day==29 && !isleap)) {
				console.log('not leap year you entered 29');
				this.setState({errorMessage: 'Year is not leap, invalid day'});
				return false;
			}
			return true;
		}
		return true;
	}

	handleYearChange = (event) => {
		let year = event.target.value;
		let validYear = this.validateYear(year);
		this.setState({validDate: validYear, year});
	}

	handleMonthChange = (event) => {
		let month = event.target.value;
		let validMonth = this.validateMonth(month, this.state.year);
		console.log(validMonth);
		this.setState({month: month, validDate: validMonth});
	};

	handleDayChange = (event) => {
		let day = event.target.value;
		console.log('date is ' + day);
		let validDay = this.validateDay(day, this.state.month, this.state.year);
		console.log(validDay);
		this.setState({day, validDate: validDay})
	};

	render() {
		let finalDate = `${this.state.year}${this.state.month ? -this.state.month : ''}${this.state.day ? -this.state.day : ''} `;
		const labelElement =
			<ValidationLabel
				empty={finalDate.length == 1}
				error={this.state.validDate ? '' : 'true'}
			>
				{this.props.label}
			</ValidationLabel>;

		const groupClassName = classNames({hidden: !this.props.show});
		return (
			<div>
				<CustomInput
					groupClassName={groupClassName}
					label={labelElement}
				>
					<div>
						<input
							maxLength="4"
							placeholder="YYYY"
							style={{width: '50px'}}
							type="text"
							value={this.state.year}
							onChange={this.handleYearChange}
						/>-
						<input
							maxLength="2"
							placeholder="MM"
							style={{width: '40px'}}
							type="text"
							value={this.state.month}
							onChange={this.handleMonthChange}
						/>-
						<input
							maxLength="2"
							placeholder="DD"
							style={{width: '40px'}}
							type="text"
							value={this.state.day}
							onChange={this.handleDayChange}
						/>
					</div>
				</CustomInput>
				{!this.state.validDate && <span className='text-danger'>{this.state.errorMessage}</span>}
			</div>

		);
	}
}

DateField.propTypes = {
	defaultValue: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	show: PropTypes.bool.isRequired
};

export default DateField;
