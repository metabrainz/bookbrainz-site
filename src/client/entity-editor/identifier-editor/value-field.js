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

import CustomInput from '../../input';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from '../common/validation-label';


/**
 * Presentational component. Renders a text input field for setting the value
 * of an identifier, with an associated ValidationLabel.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {boolean} props.empty - Passed to the ValidationLabel within the
 *        component to indicate that the field is empty.
 * @returns {ReactElement} A React component containing the rendered input
 *          component.
 */
function ValueField({
	error,
	empty,
	...rest
}) {
	const label = (
		<ValidationLabel empty={empty} error={error}>
			Value
		</ValidationLabel>
	);

	return (
		<CustomInput autoFocus label={label} type="text" {...rest}/>
	);
}
ValueField.displayName = 'ValueField';
ValueField.propTypes = {
	empty: PropTypes.bool,
	error: PropTypes.bool
};
ValueField.defaultProps = {
	empty: true,
	error: false
};

export default ValueField;
