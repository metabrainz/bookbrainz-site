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

import React from 'react';


const {useCallback} = React;

/**
 * Props for DragAndDropImage component
 * @typedef {Object} Props
 * @property {number} achievementId - ID of the achievement
 * @property {string} achievementName - Name of the achievement
 * @property {string} height - Height of the image
 * @property {string} src - Image source URL
 */

type Props = {
	achievementId: number;
	achievementName: string;
	height: string;
	src: string;
};

/**
 * The `DragAndDropImage` component renders an image of a particular achievement badge, which can be dragged to set the user's publicly showcased achievements.
 *
 * @param {Props} props - Props for the component
 *
 * @returns {JSX.Element} - The rendered image element.
 */

function DragAndDropImage({achievementId, achievementName, height, src}: Props): JSX.Element {
	/**
	 * Transfers the data of the achievement badge component properties to the DragEvent, which in turn transfers the data on handleDrop to that of the achievement badge which will be showcased on editor's public profile.
	 * @param {React.DragEvent<HTMLImageElement>} ev - The drag event object.
	 */
	const handleDragStart = useCallback((ev: React.DragEvent<HTMLImageElement>) => {
		const data = {
			id: achievementId,
			name: achievementName,
			src
		};
		ev.dataTransfer.setData('text', JSON.stringify(data));
	}, [achievementId, achievementName, src]);

	return (
		<img
			draggable
			height={height}
			src={src}
			onDragStart={handleDragStart}
		/>
	);
}

DragAndDropImage.displayName = 'DragAndDropImage';

export default DragAndDropImage;
