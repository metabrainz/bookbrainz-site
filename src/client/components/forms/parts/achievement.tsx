/*
 * Copyright (C) 2016  Max Prettyjohns
 * 				 2023  Meziyum
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
import type {Achievement} from '../../input/drag-and-drop';
import DragAndDropImage from '../../input/drag-and-drop-image';
import React from 'react';


const {Card, Col, Container, Row} = bootstrap;
/* eslint-disable sort-keys */
const maxAchievementProgress = {
	1: 1,
	2: 50,
	3: 250,
	4: 1,
	5: 10,
	6: 100,
	7: 1,
	8: 10,
	9: 100,
	10: 10,
	11: 7,
	12: 30,
	13: 1,
	14: 1,
	15: 1,
	16: 10,
	17: 100,
	18: 1,
	19: 10,
	20: 100,
	21: 1,
	22: 10,
	23: 100,
	24: 10,
	25: 100,
	26: 1000,
	27: 1,
	28: 1,
	29: 10,
	30: 100
};
/* eslint-enable sort-keys */

interface AchievementComponentProps {
	achievement: Achievement
}

/**
 * Achievement Component
 *
 * A React component that displays an achievement card with its details, including name,
 * description, badge image, and progress if the achievement is locked.
 *
 * @component
 *
 * @param {Object} props - The props for the Achievement component.
 * @param {Achievement} props.achievement - The achievement object containing details.
 * @param {number} props.counter - The current progress or counter for the achievement.
 * @param {boolean} props.unlocked - A boolean indicating whether the achievement is unlocked.
 *
 * @returns {JSX.Element} The rendered Achievement card component.
 */
function AchievementComponent({achievement}: AchievementComponentProps): JSX.Element {
	const {id, name, description, badgeUrl, counter, unlocked} = achievement;
	const imgElement = unlocked ? (
		<DragAndDropImage
			achievementId={id}
			achievementName={name}
			height="100px"
			src={badgeUrl}
		/>
	) : (
		<img
			alt={name}
			height="100px"
			src={badgeUrl}
		/>
	);

	return (
		<Card bg="light">
			<Container fluid>
				<Row>
					<Col md={2}>
						{imgElement}
					</Col>
					<Col md={8}>
						<div className="h2">
							{name}
						</div>
						<p>{description}</p>
					</Col>
					{!unlocked &&
					<Col>
						<div className="h3">
							{counter}/{maxAchievementProgress[achievement.id] ?? 0}
						</div>
					</Col>
					}
				</Row>
			</Container>
		</Card>
	);
}

AchievementComponent.displayName = 'achievement';

export default AchievementComponent;
