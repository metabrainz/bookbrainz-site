import * as _ from 'lodash';
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import {ISODateStringToObject, dateObjectToISOString, getTodayDate} from '../../helpers/utils';
import {isValid, parseISO} from 'date-fns';
import CustomInput from '../../input';
import DatePicker from 'react-datepicker';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from './validation-label';
import classNames from 'classnames';
import {dateIsBefore} from '../validators/base';
import {faCalendarAlt} from '@fortawesome/free-solid-svg-icons';
import {transformISODateForDisplay} from '../../helpers/entity';


class DateField extends React.Component {
	constructor(props) {
		super(props);

		const {day, month, year} = ISODateStringToObject(this.props.defaultValue);
		this.state = {
			day: !day ? '' : this.padMonthOrDay(day),
			month: !month ? '' : this.padMonthOrDay(month),
			warn: dateIsBefore(getTodayDate(), {day, month, year}),
			year: !year ? '' : this.formatYearForDisplay(year)
		};
	}

	updateDate = (day, month, year) => {
		this.props.onChangeDate(
			dateObjectToISOString({day, month, year})
		);

		this.setState({warn: dateIsBefore(getTodayDate(), {day, month, year})});
	};

	setStateCallback = () => {
		this.updateDate(this.state.day, this.state.month, this.state.year);
	};

	handleYearChange = (event) => {
		const year = event.target.value;
		this.setState(
			{year},
			this.setStateCallback
		);
	};

	handleMonthChange = (event) => {
		const month = event.target.value;
		this.setState(
			{month},
			this.setStateCallback
		);
	};

	handleDayChange = (event) => {
		const day = event.target.value;
		this.setState(
			{day},
			this.setStateCallback
		);
	};

	/**
	 * If year is a number, pad it for clarity ('84' -> '0084' to clarify it isn't '1984')
	 * If it is too long (eg. extended ISO format ±YYYYYY), trim it
	 * @function formatYearForDisplay
	 * @param  {string|number} year - The year string or number to format
	 * @returns {string} a short ISO date string (YYYY-MM-DD)
	 */
	formatYearForDisplay = (year) => {
		if (isNaN(Number(year)) || year === '') {
			return year;
		}
		const isCommonEraDate = Math.sign(year) === 1;
		const ISOyear = `${isCommonEraDate ? '+' : '-'}${_.padStart(Math.abs(year), 6, 0)}`;
		return transformISODateForDisplay(ISOyear);
	};

	padMonthOrDay = (num) => {
		// If month/day is a number, pad it, mostly to match the year padding mechanism
		if (isNaN(Number(num)) || num === '') {
			return num;
		}
		return _.padStart(num, 2, 0);
	};

	handleYearInputBlur = (event) => {
		const year = event.target.value;
		this.setState({year: this.formatYearForDisplay(year)});
	};

	handleMonthInputBlur = (event) => {
		const month = event.target.value;
		this.setState({month: this.padMonthOrDay(month)});
	};

	handleDayInputBlur = (event) => {
		const day = event.target.value;
		this.setState({day: this.padMonthOrDay(day)});
	};

	handleChangeOfDatePicker = (value) => {
		const date = new Date(value);
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString();
		const day = date.getDate().toString();
		this.setState(
			{day: this.padMonthOrDay(day), month: this.padMonthOrDay(month), year: this.formatYearForDisplay(year)},
			this.setStateCallback
		);
	};

	render() {
		const warnMessage = 'Are you sure? You entered a date in the future!';
		const labelElement = (
			<ValidationLabel
				empty={this.props.empty}
				error={this.props.error}
				errorMessage={this.props.errorMessage}
				warn={this.state.warn}
				warnMessage={warnMessage}
			>
				{this.props.label}
			</ValidationLabel>
		);
		const dateString = dateObjectToISOString({
			day: this.state.day,
			month: this.state.month,
			year: this.state.year
		});
		const selectedDate = parseISO(dateString);
		const groupClassName = classNames({hidden: !this.props.show});
		const isCommonEraDate = Math.sign(this.state.year) === 1 || Math.sign(this.state.year) === 0;
		return (
			<div>
				<CustomInput
					groupClassName={groupClassName}
					label={labelElement}
				>
					<InputGroup style={{width: '18em'}}>
						<FormControl
							maxLength={isCommonEraDate ? 4 : 5}
							placeholder="YYYY"
							type="text"
							value={this.state.year}
							onBlur={this.handleYearInputBlur}
							onChange={this.handleYearChange}
						/>
						<InputGroup.Addon style={{padding: '0 0.5em'}}>-</InputGroup.Addon>
						<FormControl
							maxLength="2"
							placeholder="MM"
							style={{width: '3.5em'}}
							type="text"
							value={this.state.month}
							onBlur={this.handleMonthInputBlur}
							onChange={this.handleMonthChange}
						/>
						<InputGroup.Addon style={{padding: '0 0.5em'}}>-</InputGroup.Addon>
						<FormControl
							maxLength="2"
							placeholder="DD"
							style={{width: '3.5em'}}
							type="text"
							value={this.state.day}
							onBlur={this.handleDayInputBlur}
							onChange={this.handleDayChange}
						/>
						<InputGroup.Button style={{fontSize: 'inherit'}}>
							<DatePicker
								peekNextMonth
								showMonthDropdown
								showYearDropdown
								customInput={
									<Button style={{lineHeight: '1.75', padding: '0.375em 0.938em'}} title="Date picker" variant="info">
										<FontAwesomeIcon icon={faCalendarAlt}/>
									</Button>
								}
								dateFormat="uuuuuu-MM-dd"
								disabled={!isCommonEraDate}
								dropdownMode="select"
								popperPlacement="top-end"
								selected={isValid(selectedDate) ? selectedDate : null}
								timeFormat="false"
								onChange={this.handleChangeOfDatePicker}
							/>
						</InputGroup.Button>
					</InputGroup>
				</CustomInput>

			</div>

		);
	}
}

DateField.propTypes = {
	defaultValue: PropTypes.string,
	empty: PropTypes.bool.isRequired,
	error: PropTypes.bool.isRequired,
	errorMessage: PropTypes.string,
	label: PropTypes.string.isRequired,
	onChangeDate: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired
};
DateField.defaultProps = {
	defaultValue: '',
	errorMessage: null
};

export default DateField;
