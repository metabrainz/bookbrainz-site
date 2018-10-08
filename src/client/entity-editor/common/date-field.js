/*
 * Copyright (C) 2016  Ben Ockmore
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

// @flow

import CustomInput from '../../input';
import DatePicker from 'react-datepicker';
import {FormControl} from 'react-bootstrap';
import React from 'react';
import ValidationLabel from '../common/validation-label';
import classNames from 'classnames';
import moment from 'moment';


type Props = {
	show?: boolean,
	label: string,
	empty?: boolean,
	error?: boolean,
	defaultValue?: string
};

/**
 * Presentational component. This component renders a plain text input which
 * can be hidden, and an associated ValidationLabel.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @param {boolean} props.show - Determines the visibility of the field - if
 *        falsey, bootstrap's 'hidden' class is applied.
 * @param {string} props.label - The text to be used for the input label.
 * @returns {Object} A React component containing the rendered input.
 */
function DateField({
	show,
	label,
	empty,
	error,
	defaultValue,
	...rest
}: Props) {
	const labelElement =
		<ValidationLabel empty={empty} error={error}>{label}</ValidationLabel>;

	const groupClassName = classNames({hidden: !show});
	const momentDate = moment(defaultValue);

	return (
		<CustomInput
			groupClassName={groupClassName}
			label={labelElement}
		>
			<DatePicker
				peekNextMonth
				showMonthDropdown
				showYearDropdown
				dateFormat="YYYY-MM-DD"
				dropdownMode="select"
				selected={momentDate.isValid() ? momentDate : null}
				timeFormat="false"
				viewMode="years"
				{...rest}
				customInput={
					<FormControl
						value={defaultValue}
						{...rest}
					/>
				}
			/>
		</CustomInput>
	);
}
DateField.displayName = 'DateField';
DateField.defaultProps = {
	defaultValue: null,
	empty: true,
	error: false,
	show: true
};

export default DateField;
