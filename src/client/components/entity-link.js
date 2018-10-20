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

import PropTypes from 'prop-types';
import React from 'react';


function EntityLink({bbid, text, type}) {
	return (
		<a href={`/${type.toLowerCase()}/${bbid}`}>
			{text}
		</a>
	);
}

EntityLink.displayName = 'EntityLink';
EntityLink.propTypes = {
	bbid: PropTypes.string.isRequired,
	text: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired
};

export default EntityLink;
