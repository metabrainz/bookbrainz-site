/* eslint-disable no-extra-parens,eqeqeq,sort-keys */
export function dateValidator(day, month, year) {
	const isPosIntRegx = /^\+?([0-9]\d*)$/;
	const isYearInt = Number.isInteger(Number(year));
	const isMonthPosInt = isPosIntRegx.test(month) && month > 0;
	const isDayPosInt = isPosIntRegx.test(day) && day > 0;

	if (!year) {
		if (!month && !day) {
			return {isValid: true, errorMessage: ''};
		}
		return {isValid: false, errorMessage: 'Year must be entered'};
	}

	if (!isYearInt) {
		return {isValid: false, errorMessage: 'Year is not valid'};
	}
	if (!month) {
		if (!day) {
			return {isValid: true, errorMessage: ''};
		}
		return {isValid: false, errorMessage: 'Month must be entered'};
	}
	if (!isMonthPosInt) {
		return {isValid: false, errorMessage: 'Month is not valid'};
	}
	else if (month < 1 || month > 12) {
		return {isValid: false, errorMessage: 'Month is not valid'};
	}
	if (!day) {
		return {isValid: true, errorMessage: ''};
	}
	else if (!isDayPosInt) {
		return {isValid: false, errorMessage: 'Day is not valid'};
	}
	else if (day < 1 || day > 31) {
		return {isValid: false, errorMessage: 'Day is not valid'};
	}
	else if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31) {
		return {isValid: false, errorMessage: 'Day is not valid for this month'};
	}
	else if (month == 2) {
		const isleap = (year % 100 == 0) ? (year % 400 == 0) : (year % 4 == 0);
		if (day < 1 || day > 29) {
			return {isValid: false, errorMessage: 'Day is not valid for this month'};
		}
		else if (day > 29 || (day == 29 && !isleap)) {
			return {isValid: false, errorMessage: 'Year is not leap, invalid day'};
		}
	}
	return {isValid: true, errorMessage: ''};
}
