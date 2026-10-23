import {isNil as _isNil} from 'lodash';


function isEmpty(value) {
	return _isNil(value) || value === '';
}

// Return message keys so the date field can translate them using its current locale.
export function dateValidator(dayObj, monthObj, yearObj) {
	const year = Number.parseInt(yearObj, 10);
	const month = Number.parseInt(monthObj, 10);
	const day = Number.parseInt(dayObj, 10);

	// Valid years are any integer value or, if month and day are also nil, nil
	if (isEmpty(yearObj)) {
		if (isEmpty(monthObj) && isEmpty(dayObj)) {
			return {errorMessage: '', isValid: true};
		}

		return {errorMessage: 'entityEditor.dateValidation.yearRequired', isValid: false};
	}
	else if (!Number.isInteger(year)) {
		return {errorMessage: 'entityEditor.dateValidation.invalidYear', isValid: false};
	}

	// Valid months are 1 through 12 or, if day is also nil, nil
	if (isEmpty(monthObj)) {
		if (isEmpty(dayObj)) {
			return {errorMessage: '', isValid: true};
		}

		return {errorMessage: 'entityEditor.dateValidation.monthRequired', isValid: false};
	}
	else if (!Number.isInteger(month)) {
		return {errorMessage: 'entityEditor.dateValidation.invalidMonth', isValid: false};
	}
	else if (month < 1 || month > 12) {
		return {errorMessage: 'entityEditor.dateValidation.invalidMonth', isValid: false};
	}

	// Valid days are dependent on the month, but nil is also valid
	if (isEmpty(dayObj)) {
		return {errorMessage: '', isValid: true};
	}
	else if (!Number.isInteger(day)) {
		return {errorMessage: 'entityEditor.dateValidation.invalidDay', isValid: false};
	}
	else if (day < 1 || day > 31) {
		return {errorMessage: 'entityEditor.dateValidation.invalidDay', isValid: false};
	}
	else if ((month === 4 || month === 6 || month === 9 || month === 11) && day === 31) {
		return {errorMessage: 'entityEditor.dateValidation.invalidDayForMonth', isValid: false};
	}
	else if (month === 2) {
		const isLeapYear = year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;

		if (day < 1 || day > 29) {
			return {errorMessage: 'entityEditor.dateValidation.invalidDayForMonth', isValid: false};
		}
		else if (day > 29 || (day === 29 && !isLeapYear)) {
			return {errorMessage: 'entityEditor.dateValidation.invalidLeapDay', isValid: false};
		}
	}

	return {errorMessage: '', isValid: true};
}
