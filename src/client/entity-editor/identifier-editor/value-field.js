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

import {Input} from 'react-bootstrap';
import React from 'react';
import ValidationLabel from '../common/validation-label';

/**
 * Presentational component. Renders the name field for the alias section of
 * entity editing forms.
 *
 * @returns {Object} a React component containing the rendered input
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
		<Input
			label={label}
			type="text" {...rest}
		/>
	);
}
ValueField.displayName = 'ValueField';
ValueField.propTypes = {
	empty: React.PropTypes.bool,
	error: React.PropTypes.bool
};

export default ValueField;
