/*
 * Copyright (C) 2016  Daniel Hsing
 * 				 2016  Max Prettyjohns
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

import * as ReactSticky from 'react-sticky';
import * as bootstrap from 'react-bootstrap';
import DragAndDrop, {blankBadge} from '../../input/drag-and-drop';
import Achievement from '../../forms/parts/achievement';
import PropTypes from 'prop-types';
import React from 'react';


const {Alert, Button, CardDeck, Col, Form, Row} = bootstrap;
const {Sticky, StickyContainer} = ReactSticky;
const {useState, useCallback, useEffect} = React;

/**
 * Returns the initial slot achievement for a given rank index,
 * falling back to blankBadge when nothing is saved.
 * currAchievement.model is an array of AchievementUnlock objects (camelCased),
 * each with a profileRank (1–3) and a nested achievement object.
 * @param {Object} currAchievement - The current achievement data object
 * @param {number} index - Zero-based slot index
 * @returns {Object} Achievement object for slot or blankBadge
 */
function getInitialSlot(currAchievement, index) {
	const rank = index + 1;
	const unlock = currAchievement?.model?.find(
		(unlockItem) => unlockItem.profileRank === rank
	);
	if (!unlock?.achievement) {
		return blankBadge;
	}
	return {
		badgeUrl: unlock.achievement.badgeUrl,
		id: unlock.achievement.id,
		name: unlock.achievement.name
	};
}

/**
 * Renders the document and displays the 'Editor Achievements Tab'.
 * @returns {JSX.Element} The rendered component
 */
function EditorAchievementTab({achievement, currAchievement, editor, isOwner, showSuccess}) {
	// Lifted rank state — all three slots live here so we can enforce uniqueness.
	const [ranks, setRanks] = useState([
		getInitialSlot(currAchievement, 0),
		getInitialSlot(currAchievement, 1),
		getInitialSlot(currAchievement, 2)
	]);

	// Sync slots if currAchievement prop updates after the initial render
	// (e.g. when the parent re-renders with freshly loaded data).
	useEffect(() => {
		setRanks([
			getInitialSlot(currAchievement, 0),
			getInitialSlot(currAchievement, 1),
			getInitialSlot(currAchievement, 2)
		]);
	}, [currAchievement]);

	const [successDismissed, setSuccessDismissed] = useState(false);

	/**
	 * Called when a badge is dropped onto slot `index`.
	 * Prevents the same badge from being placed in more than one slot.
	 */
	const handleDrop = useCallback((index, data) => {
		setRanks(prev => {
			const next = [...prev];
			// If this badge is already in another slot, move it (clear that slot).
			const existingIndex = prev.findIndex(
				(slot, i) => i !== index && slot?.id === data.id
			);
			if (existingIndex !== -1) {
				next[existingIndex] = blankBadge;
			}
			next[index] = {badgeUrl: data.src, id: data.id, name: data.name};
			return next;
		});
	}, []);

	/**
	 * Called when a slot is clicked to remove its badge.
	 */
	const handleClear = useCallback((index) => {
		setRanks(prev => {
			const next = [...prev];
			next[index] = blankBadge;
			return next;
		});
	}, []);

	function renderAchievements() {
		const unlocked = [];
		const locked = [];
		achievement.model.forEach(ach => {
			const achievementHTML = (
				<Achievement
					achievement={ach}
					key={`${editor.id}${ach.id}`}
				/>
			);
			if (ach.unlocked) {
				unlocked.push(achievementHTML);
			}
			else {
				locked.push(achievementHTML);
			}
		});
		return [unlocked, locked];
	}

	const [achievements, locked] = renderAchievements();

	let rankUpdate;
	if (isOwner) {
		rankUpdate = (
			<Form
				className="padding-bottom-1"
				id="rankSelectForm"
				method="post"
			>
				<CardDeck className="mb-3">
					{ranks.map((slot, i) => (
						<DragAndDrop
							achievement={slot}
							key={`rank${i + 1}`}
							name={`rank${i + 1}`}
							onClear={handleClear}
							onDrop={handleDrop}
						/>
					))}
				</CardDeck>
				<div className="mt-3">
					<Button type="submit" variant="success">
						Update
					</Button>
					<div className="text-muted ms-2">
						Drag a badge from below to assign it to a rank slot.
					</div>
				</div>
			</Form>
		);
	}

	const STICKY_TOP_MARGIN = 64;
	return (
		<Row>
			<Col lg={{offset: 1, span: 10}}>
				<div id="achievementsForm">
					{showSuccess && !successDismissed && (
						<Alert
							dismissible
							className="mt-2"
							variant="success"
							onClose={setSuccessDismissed}
						>
							Your featured badges have been updated successfully.
						</Alert>
					)}
					<StickyContainer>
						<Sticky topOffset={-80}>
							{
								({style}) => {
									const updatedStyle = {
										...style,
										background: 'white',
										borderBottom: '1px solid #ebe2df',
										flex: '1',
										marginTop: STICKY_TOP_MARGIN,
										zIndex: 10
									};
									return (
										<div style={updatedStyle}>
											{rankUpdate}
										</div>
									);
								}
							}
						</Sticky>
						<div style={{zIndex: 1}}>
							<div className="h1">Unlocked Achievements</div>
							{achievements}
							<div className="h1">Locked Achievements</div>
							{locked}
						</div>
					</StickyContainer>
				</div>
			</Col>
		</Row>
	);
}

EditorAchievementTab.displayName = 'EditorAchievementTab';
EditorAchievementTab.propTypes = {
	achievement: PropTypes.shape({
		model: PropTypes.array
	}).isRequired,
	currAchievement: PropTypes.shape({
		model: PropTypes.array
	}).isRequired,
	editor: PropTypes.shape({
		authenticated: PropTypes.bool,
		id: PropTypes.number
	}).isRequired,
	isOwner: PropTypes.bool.isRequired,
	showSuccess: PropTypes.bool
};

EditorAchievementTab.defaultProps = {
	showSuccess: false
};

export default EditorAchievementTab;
