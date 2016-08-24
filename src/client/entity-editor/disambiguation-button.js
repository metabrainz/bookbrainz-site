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

import {Button} from 'react-bootstrap';

import React from 'react';
import {connect} from 'react-redux';

let DisambiguationButton = ({
	...props
}) => (
	<Button
		bsStyle="link"
		{...props}
	>
		Add disambiguation…
	</Button>
);
DisambiguationButton.displayName = 'DisambiguationButton';

DisambiguationButton = connect(
	null,
	(dispatch) => ({
		onClick: () => dispatch({
			type: 'SHOW_DISAMBIGUATION'
		})
	})
)(DisambiguationButton);

export default DisambiguationButton;
