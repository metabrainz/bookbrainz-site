export function dateValidator(day, month, year) {
	const isPosIntRegx = /^\+?([0-9]\d*)$/;
	const isYearInt = Number.isInteger(Number(year));
	const isMonthPosInt = isPosIntRegx.test(month) && month > 0;
	const isDayPosInt = isPosIntRegx.test(day) && day > 0;

	if (!year) {
		if (!month && !day) {
			return {errorMessage: '', isValid: true};
		}

		return {errorMessage: 'Year must be entered', isValid: false};
	}

	if (!isYearInt) {
		return {errorMessage: 'Year is not valid', isValid: false};
	}

	if (!month) {
		if (!day) {
			return {errorMessage: '', isValid: true};
		}

		return {errorMessage: 'Month must be entered', isValid: false};
	}
	if (!isMonthPosInt) {
		return {errorMessage: 'Month is not valid', isValid: false};
	}

	else if (month < 1 || month > 12) {
		return {errorMessage: 'Month is not valid', isValid: false};
	}

	if (!day) {
		return {errorMessage: '', isValid: true};
	}
	else if (!isDayPosInt) {
		return {errorMessage: 'Day is not valid', isValid: false};
	}
	else if (day < 1 || day > 31) {
		return {errorMessage: 'Day is not valid', isValid: false};
	}
	else if ((month === 4 || month === 6 || month === 9 || month === 11) && day === 31) {
		return {errorMessage: 'Day is not valid for this month', isValid: false};
	}
	else if (month === 2) {
		const isleap = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
		if (day < 1 || day > 29) {
			return {errorMessage: 'Day is not valid for this month', isValid: false};
		}
		else if (day > 29 || (day === 29 && !isleap)) {
			return {errorMessage: 'Year is not leap, invalid day', isValid: false};
		}
	}

	return {errorMessage: '', isValid: true};
}
