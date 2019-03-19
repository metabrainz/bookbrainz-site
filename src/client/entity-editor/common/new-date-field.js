/* eslint-disable */

import CustomInput from '../../input';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from './validation-label';
import classNames from 'classnames';
import {getSeparatedDate} from '../validators/date';


class DateField extends React.Component {
	constructor(props) {
		super(props);
		//const initialDate = getSeparatedDate(this.props.defaultValue);
		const day = this.props.defaultValue ? this.props.defaultValue.get('day') : null;
		const month = this.props.defaultValue ? this.props.defaultValue.get('month') : null;
		const year = this.props.defaultValue ? this.props.defaultValue.get('year') : null;
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		console.log(day, month, year);
		console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
		this.state = {
			day: !day?null:day,
			month: !month?null:month,
			year: !year?null:year
		};
	}
	// componentWillMount() {
	// 	this.updateDate(this.state.day, this.state.month, this.state.year);
	// }
	updateDate = (day, month, year) => {
		console.log('validate month called with ' + 'day-' + day + '-month-' + month + '-year-' + year);
		let enteredDate = year;
		if(month){
		  enteredDate += `-${month}`;
		  if(day){
		    enteredDate += `-${day}`;
		  }
		}
		console.log('@@@@@@@@@@  entered date ' + enteredDate);

		this.props.onChangeDate({year: !year?null:year, month: !month?null:month, day: !day?null:day});
	};

	handleYearChange = (event) => {
		let year = event.target.value;
		//let validYear = validateYear(this.state.day, this.state.month, year);
		this.setState({year});
		this.updateDate(this.state.day, this.state.month, year);
	};

	handleMonthChange = (event) => {
		let month = event.target.value;
		// let validMonth = validateMonth(this.state.day, month, this.state.year);
		// console.log(validMonth);
		this.setState({month});
		this.updateDate(this.state.day, month, this.state.year);
	};

	handleDayChange = (event) => {
		let day = event.target.value;
		console.log('date is ' + day);
		// let validDay = validateDay(day, this.state.month, this.state.year);
		// console.log(validDay);
		this.setState({day})
		this.updateDate(day, this.state.month, this.state.year);
	};

	render() {
		console.log('error got ' + this.props.error);
		console.log('empty got ' + this.props.empty);
		const labelElement = (
			<ValidationLabel
				empty={this.props.empty}
				error={this.props.error}
			>
				{this.props.label}
			</ValidationLabel>
		);

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
