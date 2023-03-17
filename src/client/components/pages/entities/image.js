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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {faSlash} from '@fortawesome/free-solid-svg-icons';


const {Image} = bootstrap;

function EntityImage({backupIcon, deleted, imageUrl}) {
	if (imageUrl) {
		return (
			<Image
				responsive
				src={imageUrl}
			/>
		);
	}

	if (deleted) {
		return (
			<div className="entity-display-icon fa-layers fa-fw">
				<FontAwesomeIcon
					icon={backupIcon}
					key="entityIcon"
					size="5x"
					stack="1x"
				/>,
				<FontAwesomeIcon
					icon={faSlash}
					key="deletedIcon"
					size="5x"
					stack="1x"
				/>
			</div>);
	}

	return (
		<div className="entity-display-icon">
			<FontAwesomeIcon
				icon={backupIcon}
				size="5x"
			/>
		</div>
	);
}

EntityImage.displayName = 'EntityImage';
EntityImage.propTypes = {
	backupIcon: PropTypes.object.isRequired,
	deleted: PropTypes.bool,
	imageUrl: PropTypes.string
};

EntityImage.defaultProps = {
	deleted: false,
	imageUrl: ''
};
export default EntityImage;
