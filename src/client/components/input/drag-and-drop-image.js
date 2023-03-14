/*
 * Copyright (C) 2016  Max Prettyjohns
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

const {useCallback} = React;

function DragAndDropImage({achievementId, achievementName, height, src}) {
	const handleDragStart = useCallback((ev) => {
		const data = {
			id: achievementId,
			name: achievementName,
			src
		};
		ev.dataTransfer.setData('text', JSON.stringify(data));
	}, [achievementId, achievementName, src]);

	return (
		<img
			draggable="true"
			height={height}
			src={src}
			onDragStart={handleDragStart}
		/>
	);
}

DragAndDropImage.displayName = 'DragAndDropImage';
DragAndDropImage.propTypes = {
	achievementId: PropTypes.number.isRequired,
	achievementName: PropTypes.string.isRequired,
	height: PropTypes.string.isRequired,
	src: PropTypes.string.isRequired
};

export default DragAndDropImage;
