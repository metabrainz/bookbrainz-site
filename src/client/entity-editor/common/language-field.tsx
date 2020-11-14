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
import CustomInput from '../../input';
import ValidationLabel from './validation-label';
import VirtualizedSelect from 'react-virtualized-select';


type Props = {
	empty?: boolean,
	error?: boolean,
	tooltipText?: string,
	[propName: string]: any
};

/**
 * Presentational component. This component renders a dropdown selection box
 * allowing the user to select from a list of provided language options. The
 * input is labelled with a ValidationLabel containing the text 'Language'.
 *
 * @param {Object} props - The properties passed to the component, which are
 *        then passed to the underlying VirtualizedSelect component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @returns {Object} A React component containing the rendered input.
 */
function LanguageField({
	empty,
	error,
	tooltipText,
	...rest
}: Props) {
	const label =
		<ValidationLabel empty={empty} error={error}>Language</ValidationLabel>
	;

	return (
		<CustomInput label={label} tooltipText={tooltipText}>
			<VirtualizedSelect {...rest}/>
		</CustomInput>
	);
}
LanguageField.displayName = 'LanguageField';
LanguageField.defaultProps = {
	empty: false,
	error: false,
	tooltipText: null
};

export default LanguageField;
