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
import VirtualizedSelect from 'react-virtualized-select';

/**
 * Presentational component. This component renders a dropdown selection box
 * allowing the user to select from a list of provided language options. The
 * input is labelled with a ValidationLabel containing the text 'Language'.
 *
 * @param {Object} props - The properties passed to the component, which are
 *        then passed to the underlying VirtualizedSelect component.
 * @returns {Object} A React component containing the rendered input.
 */
function LanguageField(props) {
	return (
		<Input label="Language">
			<VirtualizedSelect {...props}/>
		</Input>
	);
}
LanguageField.displayName = 'LanguageField';

export default LanguageField;
