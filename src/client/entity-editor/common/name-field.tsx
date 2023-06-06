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


import * as React from 'react';
import {Form, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ValidationLabel from '../common/validation-label';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';


type Props = {
	empty?: boolean,
	error?: boolean,
	label?: string,
	tooltipText?: string,
	defaultValue?:string,
	onChange?:(arg)=>void,
	warn?: boolean
};

/**
 * Presentational component. This component renders a plain text input and a
 * ValidationLabel for a field labelled 'Name'.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.warn - Passed to the ValidationLabel within the
 * 		  component to indicate a validation warning.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @returns {Object} a React component containing the rendered input
 */
function NameField({
	empty,
	error,
	label,
	tooltipText,
	warn,
	...rest
}: Props) {
	const inputLabel = (
		<ValidationLabel empty={empty} error={error} warn={warn}>
			{!label ? 'Name' : label}
		</ValidationLabel>
	);

	const helpIconElement = tooltipText && (
		<OverlayTrigger
			delay={50}
			overlay={<Tooltip>{tooltipText}</Tooltip>}
		>
			<FontAwesomeIcon
				className="margin-left-0-5"
				icon={faQuestionCircle}
			/>
		</OverlayTrigger>
	);

	return (
		<Form.Group>
			<Form.Label>
				{inputLabel}
				{helpIconElement}
			</Form.Label>
			<Form.Control type="text" {...rest}/>
		</Form.Group>
	);
}
NameField.displayName = 'NameField';
NameField.defaultProps = {
	defaultValue: '',
	empty: false,
	error: false,
	label: '',
	onChange: null,
	tooltipText: null,
	warn: false
};

export default NameField;
