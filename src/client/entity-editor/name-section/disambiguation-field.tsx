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
	required?: boolean
};

/**
 * Presentational component. Renders the disambiguation field for the name
 * section of entity editing forms.
 *
 * @param {boolean} props.error - Passed to the ValidationLabel within the
 *        component to indicate a validation error.
 * @param {Object} props - an object containing the properties to be passed
 *        down to the child input element.
 * @returns {Object} a React component containing the rendered input
 */
function DisambiguationField({
	empty,
	error,
	required,
	...rest
}: Props) {
	const label = (
		<ValidationLabel empty={empty} error={error}>
			Disambiguation
			{required || null ? null :
				<span className="text-muted"> (optional)</span>
			}
		</ValidationLabel>
	);

	const tooltip = (
		<Tooltip>
			If a different entity with the same name already exists or if there is a
			need for clarification
		</Tooltip>
	);

	return (


		<Form.Group>
			<Form.Label>
				{label}
				<OverlayTrigger delay={50} overlay={tooltip}>
					<FontAwesomeIcon
						className="margin-left-0-5"
						icon={faQuestionCircle}
					/>
				</OverlayTrigger>
			</Form.Label>
			<Form.Control type="text" {...rest}/>
		</Form.Group>
	);
}
DisambiguationField.displayName = 'DisambiguationField';
DisambiguationField.defaultProps = {
	empty: false,
	error: false,
	required: false
};

export default React.memo(DisambiguationField);
