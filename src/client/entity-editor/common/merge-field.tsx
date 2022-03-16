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
import {Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {get as _get, has, isEqual} from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Select from 'react-select';
import ValidationLabel from '../common/validation-label';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';


type Props = {
	error?: boolean,
	options: any[],
	label: string,
	currentValue: any,
	onChange: any,
	tooltipText?: string | React.ReactElement,
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
	tooltipText,
	onChange,
	valueProperty,
	...rest
}: Props) {
	const labelComponent = <ValidationLabel error={error} >{label}</ValidationLabel>;

	const helpIconElement = tooltipText && (
		<OverlayTrigger delay={50} overlay={<Tooltip>{tooltipText}</Tooltip>}>
			<FontAwesomeIcon className="margin-left-0-5" icon={faQuestionCircle}/>
		</OverlayTrigger>
	);

	if (options.length <= 1) {
		const value = _get(options, `[0][${valueProperty}]`, '');
		return (
			<Form.Group>
				<Form.Label>
					{labelComponent}
					{helpIconElement}
				</Form.Label>
				<Form.Control readOnly value={value} {...rest}/>
			</Form.Group>
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
	const currentOption = options.filter((el) => isEqual(el.value, currentValue));
	return (
		<Form.Group>
			<Form.Label>
				{labelComponent}
				{helpIconElement}
			</Form.Label>
			<Select
				{...rest}
				classNamePrefix="react-select"
				instanceId={label}
				isClearable={false}
				options={options}
				value={currentOption}
				// eslint-disable-next-line react/jsx-no-bind
				onChange={onChangeReturnValue}
			/>
		</Form.Group>
	);
}
MergeField.displayName = 'MergeField';

MergeField.defaultProps = {
	error: false,
	tooltipText: null,
	valueProperty: 'label'
};

export default MergeField;
