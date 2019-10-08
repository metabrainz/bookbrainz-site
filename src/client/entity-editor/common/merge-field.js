/*
 * Copyright (C) 2019  Nicolas Pelletier
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
import React from 'react';
import Select from 'react-select';


type Props = {
	options: array,
	label: string,
	currentValue: any,
	onChange: any,
	valueProperty?: string
};

/**
 * Presentational component. This component renders a plain text input and a
 * ValidationLabel for a field labelled 'Name'.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @param {Function} props.onChange - Function to be called when the value in
 *        the wrapped input changes.
 * @returns {Object} a React component containing the rendered input
 */
function MergeField({
	options,
	label,
	currentValue,
	onChange,
	valueProperty,
	...rest
}: Props) {
	if (options.length <= 1) {
		return (
			<CustomInput
				readOnly
				label={label}
				value={options[0] ? options[0][valueProperty] : ''}
				{...rest}
			/>
		);
	}
	const onChangeReturnValue = function onChangeReturnValue(selectObject) {
		return onChange(selectObject.value);
	};
	return (
		<CustomInput label={label} {...rest}>
			<Select
				clearable={false}
				instanceId={label}
				options={options}
				value={currentValue}
				// eslint-disable-next-line react/jsx-no-bind
				onChange={onChangeReturnValue}
			/>
		</CustomInput>
	);
}
MergeField.displayName = 'MergeField';

MergeField.defaultProps = {
	valueProperty: 'label'
};

export default MergeField;
