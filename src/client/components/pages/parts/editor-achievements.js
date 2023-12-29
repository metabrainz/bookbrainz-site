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
import Achievement from '../../forms/parts/achievement';
import DragAndDrop from '../../input/drag-and-drop';
import PropTypes from 'prop-types';
import React from 'react';


const {Button, CardDeck, Col, Form, Row} = bootstrap;
const {Sticky, StickyContainer} = ReactSticky;

/**
 * Renders the document and displays the 'Editor Achievements Tab'.
 */
class EditorAchievementTab extends React.Component {
	/**
	 * Initializes the component state.
	 * @constructor
	 * @param {object} props - Properties passed to the component.
	 */
	constructor(props) {
		super(props);
		this.currAchievement = props.currAchievement;
		this.state = {
			achievement: props.achievement,
			editor: props.editor
		};
	}

	/**
	 * Renders the Editor Achievements list. Also splits the
	 * achievements into Unlocked and Locked achievements.
	 * @returns {Array} - An array containing rendered achievements
	 * list split into Unlocked and Locked.
	 */
	renderAchievements() {
		const achievements = [];
		const locked = [];
		this.state.achievement.model.forEach(achievement => {
			const achievementHTML = (
				<Achievement
					achievement={achievement}
					counter={achievement.counter}
					key={`${this.state.editor.id}${achievement.id}`}
					unlocked={achievement.unlocked}
				/>
			);
			if (achievement.unlocked) {
				achievements.push(achievementHTML);
			}
			else {
				locked.push(achievementHTML);
			}
		});
		return [achievements, locked];
	}

	/**
	 * Renders the EditorAchievements page, which displays all the achievements
	 * (both unlocked and locked) of the editor, along with a RankUpdate form.
	 * @returns {ReactElement} a HTML document which displays the
	 * EditorAchievements page.
	 */
	render() {
		const [achievements, locked] = this.renderAchievements();

		let rankUpdate;
		if (this.props.isOwner) {
			rankUpdate = (
				<Form
					className="padding-bottom-1"
					id="rankSelectForm"
					method="post"
				>
					<CardDeck className="mb-3">
						<DragAndDrop
							initialAchievement={this.currAchievement.model.fulfillmentValue[0]?.achievement}
							name="rank1"
						/>
						<DragAndDrop
							initialAchievement={this.currAchievement.model.fulfillmentValue[1]?.achievement}
							name="rank2"
						/>
						<DragAndDrop
							initialAchievement={this.currAchievement.model.fulfillmentValue[2]?.achievement}
							name="rank3"
						/>
					</CardDeck>
					<span className="margin-left-1">
						<Button type="submit" variant="success">
							Update
						</Button>
						<span className="margin-left-1">
							click badge to unset
						</span>
					</span>
				</Form>
			);
		}

		const STICKY_TOP_MARGIN = 64;
		return (
			<Row>
				<Col lg={{offset: 1, span: 10}}>
					<div id="achievementsForm">
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
	isOwner: PropTypes.bool.isRequired
};

export default EditorAchievementTab;
