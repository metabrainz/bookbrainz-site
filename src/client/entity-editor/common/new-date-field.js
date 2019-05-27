/* eslint-disable */
import {Button, FormControl, InputGroup} from 'react-bootstrap';
import CustomInput from '../../input';
import DatePicker from 'react-datepicker'
import FontAwesome from 'react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from './validation-label';
import classNames from 'classnames';
import {getSeparatedDate} from '../validators/date';
import moment from 'moment';
import {getTodayDate, dateObjectToString} from '../../helpers/utils';
import {dateIsBefore} from '../validators/base';


class DateField extends React.Component {
	constructor(props) {
		super(props);

		const {day, month, year} = this.props.defaultValue;
		this.state = {
			day: !day ? '' : day,
			month: !month ? '': month,
			year: !year ? '' : year,
			warn: dateIsBefore(getTodayDate(),{day, month, year})
		};
	}

	updateDate = (day, month, year) => {
		this.props.onChangeDate({
			year: !year ? '' : year,
			month: !month ? '' : month,
			day: !day ? '' : day
		});

		this.setState({warn: dateIsBefore(getTodayDate(),{day, month, year})});
	};

	handleYearChange = (event) => {
		let year = event.target.value;
		this.setState({year});
		this.updateDate(this.state.day, this.state.month, year);
	};

	handleMonthChange = (event) => {
		let month = event.target.value;
		this.setState({month});
		this.updateDate(this.state.day, month, this.state.year);
	};

	handleDayChange = (event) => {
		let day = event.target.value;
		this.setState({day})
		this.updateDate(day, this.state.month, this.state.year);
	};

	handleChangeOfDatePicker = (value) => {
		const date = new Date(value);
		const year = (date.getFullYear()).toString();
		const month = (date.getMonth()+1).toString();
		const day = (date.getDate()).toString();
		this.setState({year});
		this.setState({month});
		this.setState({day})
		this.updateDate(day, month, year);
	}

	render() {
		
		const labelElement = (
			<ValidationLabel
				empty={this.props.empty}
				error={this.props.error}
				warn={this.state.warn}
				errorMessage={this.props.errorMessage}
			>
				{this.props.label}
			</ValidationLabel>
		);

		const selectedDate = dateObjectToString({
			year: this.state.year,
			month: this.state.month,
			day: this.state.day
		});
		const momentDate = moment(selectedDate);
		const groupClassName = classNames({hidden: !this.props.show});
		return (
			<div>
				<CustomInput
					groupClassName={groupClassName}
					label={labelElement}
				>
					<InputGroup style={{width: '17em'}}>
						<FormControl
							maxLength="4"
							placeholder="YYYY"
							type="text"
							value={this.state.year}
							onChange={this.handleYearChange}
						/>
					<InputGroup.Addon style={{padding: "0 0.5em"}}>-</InputGroup.Addon>
						<FormControl
							maxLength="2"
							placeholder="MM"
							style={{width: '3.5em'}}
							type="text"
							value={this.state.month}
							onChange={this.handleMonthChange}
						/>
					<InputGroup.Addon style={{padding: "0 0.5em"}}>-</InputGroup.Addon>
						<FormControl
							maxLength="2"
							placeholder="DD"
							style={{width: '3.5em'}}
							type="text"
							value={this.state.day}
							onChange={this.handleDayChange}
						/>
					<InputGroup.Button style={{ fontSize: "inherit"}}>
							<DatePicker
								peekNextMonth
								showMonthDropdown
								showYearDropdown
								selected={momentDate.isValid() ? momentDate : null}
								dateFormat="YYYY-MM-DD"
								dropdownMode="select"
								timeFormat="false"
								viewMode="years"
								onChange={this.handleChangeOfDatePicker}
								customInput={
									<Button style={{lineHeight: '1.75', padding: '0.375em 0.938em'}} bsStyle="info" title="Date picker"><FontAwesome name="calendar-alt"/></Button>
								}
							/>
						</InputGroup.Button>
					</InputGroup>
				</CustomInput>

			</div>

		);
	}
}

DateField.propTypes = {
	defaultValue: PropTypes.object.isRequired,
	empty: PropTypes.bool.isRequired,
	error: PropTypes.bool.isRequired,
	label: PropTypes.string.isRequired,
	onChangeDate: PropTypes.func.isRequired,
	show: PropTypes.bool.isRequired
};

export default DateField;
