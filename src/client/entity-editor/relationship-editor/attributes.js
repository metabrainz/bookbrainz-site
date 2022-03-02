/*
 * Copyright (C) 2021 Akash Gupta
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

import {Form} from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';


export function NumberAttribute({
	onHandleChange, value
}) {
	return (
	    <>
			<Form.Label>Number</Form.Label>
			<input
				className="form-control"
				placeholder="Enter a value"
				type="text"
				value={value || ''}
				onChange={onHandleChange}
			/>
	    </>
	);
}


NumberAttribute.propTypes = {
	onHandleChange: PropTypes.func.isRequired,
	value: PropTypes.string
};

NumberAttribute.defaultProps = {
	value: ''
};
