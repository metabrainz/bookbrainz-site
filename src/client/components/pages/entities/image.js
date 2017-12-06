/*
 * Copyright (C) 2017  Ben Ockmore
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

import * as bootstrap from 'react-bootstrap';

import Icon from 'react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';


const {Image} = bootstrap;

function EntityImage({backupIcon, imageUrl}) {
	if (imageUrl) {
		return (
			<Image
				responsive
				className="margin-top-d10 margin-bottom-d10"
				src={imageUrl}
			/>
		);
	}

	return (
		<Icon
			className="margin-top-d10 margin-bottom-d10"
			name={backupIcon}
			size="5x"
		/>
	);
}
EntityImage.displayName = 'EntityImage';
EntityImage.propTypes = {
	backupIcon: PropTypes.string.isRequired,
	imageUrl: PropTypes.string.isRequired
};

export default EntityImage;
