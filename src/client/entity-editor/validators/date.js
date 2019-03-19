/* eslint-disable */

export function getSeparatedDate (value : string) {
	const date = value ? value.split('-') : [];
	return {
		year: date.length > 0 ? date[0] : '',
		month: date.length > 1 ? date[1] : '',
		day: date.length > 2 ? date[2] : ''
	};
}

export function validateYear (day, month, year) {
	console.log('validate year called with ' + 'day-' + day + '-month-' + month + '-year-' + year);
	if (year === '') {
		if (month === '' && day === '') {
			return true;
		}
		//console.log('year empty and month or day not');
		//this.setState({errorMessage: 'Year must be entered'});
		return false;
	}

	let isPositiveInt = /^\+?([0-9]\d*)$/.test(year) && year > 0;
	let isMonthDayValid = validateMonth(day, month, year) && validateDay(day, month, year);
	// console.log('Is positive int '+ isPositiveInt);
	// console.log('Is month and dat is valid ' + isMonthDayValid);
	if (!isPositiveInt) {
		//this.setState({errorMessage: 'Year is not valid entry'});
		return false;
	}
	else if (!isMonthDayValid) {
		return false;
	}
	return true;
};

export function validateMonth (day, month, year) {
	console.log('validate month called with ' + 'day-' + day + '-month-' + month + '-year-' + year);
	const isPositiveInt = /^\+?([0-9]\d*)$/.test(month) && month > 0;
	console.log('month isPositiveInt ' + isPositiveInt);

	if (month === '') {
		//console.log('empty month input');
		if (day === '') {
			return true;
		}
		//this.setState({errorMessage: 'Month must be entered'});
		return false;
	}
	else if (!isPositiveInt) {
		//this.setState({errorMessage: 'Month is not valid entry'});
		return false;
	}
	let isValidDate = validateDay(day, month, year);
	//console.log('isValid date ' + isValidDate);
	if (!isValidDate) {
		return false;
	}
	else if (year === '') {
		//this.setState({errorMessage: 'Year must be entered'});
		return false;
	}
	else if (month < 1 || month > 12) {
		//console.log(' month valid');
		//this.setState({errorMessage: 'Month is not valid entry'});
		return false;
	}
	return true;
}

export function validateDay (day, month, year) {
	console.log('validate day called with ' + 'day-' + day + '-month-' + month + '-year-' + year);
	let isPositiveInt = /^\+?([0-9]\d*)$/.test(day) && day > 0;
	if (day === '') {
		return true;
	}
	else if (!isPositiveInt) {
		//this.setState({errorMessage: 'Day is not valid entry'});
		return false;
	}
	else if (year === '' ) {
		//this.setState({errorMessage: 'Year must be entered'});
		return false;
	}
	else if (month === '') {
		//this.setState({errorMessage: 'Month must be entered'});
		return false;
	}
	else if (day < 1 || day > 31) {
		//this.setState({errorMessage: 'Day is not valid entry'});
		return false;
	}
	else if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31) {
		//this.setState({errorMessage: 'Entered month has only 30 days'});
		return false;
	}
	else if ( month == 2) {
		let isleap = (year % 100 == 0) ? (year % 400 == 0) : (year % 4 == 0);
		// console.log(' year is ' + year);
		// console.log('is leap year ' + isleap);
		if (day < 1 || day > 29) {
			//this.setState({errorMessage: 'Day is not valid entry for entered month'});
			return false;
		}
		else if (day > 29 || (day==29 && !isleap)) {
			//console.log('not leap year you entered 29');
			//this.setState({errorMessage: 'Year is not leap, invalid day'});
			return false;
		}
		return true;
	}
	return true;
}
