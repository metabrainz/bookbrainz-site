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

import {Col, Input, Row} from 'react-bootstrap';

import React from 'react';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';

function updateDisambiguationField(value) {
	return {
		type: 'UPDATE_DISAMBIGUATION_FIELD',
		value
	};
}

/**
 * Container component. Renders the name field for the alias section of entity
 * editing forms.
 *
 * @returns {Object} a React component containing the rendered input
 */
let DisambiguationField = ({
	dispatch
}) => {
	let input;

	const KEYSTROKE_DEBOUNCE_TIME = 250;
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);

	return (
		<Row>
			<Col
				md={6}
				mdOffset={3}
			>
				<Input
					label={
						<span>
							Disambiguation
							<span className="text-muted"> (optional)</span>
						</span>
					}
					ref={(node) => { input = node; }}
					type="text"
					onChange={() => debouncedDispatch(
						updateDisambiguationField(input.getInputDOMNode().value)
					)}
				/>
			</Col>
		</Row>
	);
};
DisambiguationField.displayName = 'DisambiguationField';
DisambiguationField.propTypes = {
	dispatch: React.PropTypes.func
};

DisambiguationField = connect()(DisambiguationField);

export default DisambiguationField;
