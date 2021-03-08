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


import * as React from 'react';
import {get as _get, has} from 'lodash';
import CustomInput from '../../input';
import Select from 'react-select';
import ValidationLabel from '../common/validation-label';


type Props = {
	error?: boolean,
	options: any[],
	label: string,
	currentValue: any,
	onChange: any,
	valueProperty?: string,
	[propName: string]: any
};

/**
 * Presentational component. This component renders a plain text input and a
 * ValidationLabel for a field labelled 'Name'.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {Array} props.options - Options to select from for this field
 * @param {string} props.label - The text for the ValidationLabel component
 * @param {any} props.currentValue - The currently selected value bubbled up from the state
 * @param {Function} props.onChange - Function to be called when the value in
 *        the wrapped input changes.
 * @returns {Object} a React component containing the rendered input
 */
function MergeField({
	error,
	options,
	label,
	currentValue,
	onChange,
	valueProperty,
	...rest
}: Props) {
	const labelComponent = <ValidationLabel error={error} >{label}</ValidationLabel>;
	if (options.length <= 1) {
		const value = _get(options, `[0][${valueProperty}]`, '');
		return (
			<CustomInput
				readOnly
				label={labelComponent}
				value={value}
				{...rest}
			/>
		);
	}
	const onChangeReturnValue = function onChangeReturnValue(selectObject) {
		let value;
		if (has(selectObject, 'value') && has(selectObject, 'label')) {
			({value} = selectObject);
		}
		else {
			value = selectObject;
		}
		return onChange(value);
	};
	return (
		<CustomInput label={labelComponent} {...rest}>
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
	error: false,
	valueProperty: 'label'
};

export default MergeField;
