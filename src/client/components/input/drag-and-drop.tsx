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

import * as bootstrap from 'react-bootstrap';
import React from 'react';


const {Card, Form} = bootstrap;
const {useCallback} = React;

/**
* The Achievement interface, defining the properties of an achievement.
* @typedef
* @property {string} name - The name of the achievement.
* @property {string} badgeUrl - The source URL of the achievement's badge image.
* @property {number} id - The ID of the achievement.
*/
export type Achievement = {
	badgeUrl: string | null;
	counter:number;
	description: string;
	id: number;
	name: string;
	unlocked: boolean;
};
export type AchievementForDisplay = Pick<Achievement, 'badgeUrl' | 'id' | 'name'>;

export const blankBadge: AchievementForDisplay = {
	badgeUrl: '/images/blankbadge.svg',
	id: null,
	name: 'Drop a badge here'
};

export type DroppedAchievementData = {
	id: number;
	name: string;
	src: string;
};

/**
 * Props for DragAndDrop component
 * @typedef {Object} Props
 * @property {string} name - The name of the DragAndDrop component (used as the hidden input name).
 * @property {AchievementForDisplay} achievement - The currently displayed achievement.
 * @property {function} onDrop - Callback when a badge is dropped onto this slot.
 * @property {function} onClear - Callback when this slot is clicked to remove the badge.
 */
type Props = {
  name: string;
  achievement: AchievementForDisplay;
  onDrop: (data: DroppedAchievementData) => void;
  onClear: () => void;
};

/**
* A controlled drag-and-drop card that displays an achievement badge slot.
* The parent component manages which achievement is shown via the `achievement`
* prop. When a badge is dropped in, `onDrop` is called; clicking removes it
* via `onClear`.
* @param {Props} props - Component props including name, achievement, onDrop, and onClear handlers.
* @returns {JSX.Element} The rendered DragAndDrop badge card.
*/
function DragAndDrop({name, achievement, onDrop, onClear}: Props): JSX.Element {
	const hasAchievement = Boolean(achievement?.id);

	const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (hasAchievement) {
			onClear();
		}
	}, [hasAchievement, onClear]);

	const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	}, []);

	const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		let data: DroppedAchievementData;

		try {
			data = JSON.parse(event.dataTransfer.getData('text'));
		}
		catch (error) {
			return;
		}
		onDrop(data);
	}, [onDrop]);

	const displayed = achievement ?? blankBadge;

	return (
		<Card
			bg="light"
			style={{cursor: hasAchievement ? 'pointer' : 'default'}}
			onClick={handleClick}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<Card.Img
				className="mt-4"
				height={100}
				src={displayed.badgeUrl}
				variant="top"
			/>
			<Card.Body className="text-center">
				<Form.Group>
					<Form.Control
						name={name}
						type="hidden"
						value={displayed.id ? displayed.id.toString() : ''}
					/>
				</Form.Group>
				<div className="h3">
					{displayed.name}
				</div>
				{hasAchievement &&
					<small className="text-muted">Click to remove</small>
				}
			</Card.Body>
		</Card>
	);
}

DragAndDrop.displayName = 'DragAndDrop';

export default DragAndDrop;
