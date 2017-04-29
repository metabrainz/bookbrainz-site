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
import Achievement from '../../forms/parts/achievement';
import DragAndDrop from '../../input/drag-and-drop';
import React from 'react';
import bootstrap from 'react-bootstrap';
import request from 'superagent-bluebird-promise';

const {Row} = bootstrap;
const {Sticky, StickyContainer} = ReactSticky;

class EditorAchievementTab extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			achievement: props.achievement,
			editor: props.editor
		};
	}
	handleSubmit(event) {
		event.preventDefault();

		const data = {
			id: this.state.editor.id,
			rank1: this.rank1,
			rank2: this.rank2,
			rank3: this.rank3
		};

		request.post('/editor/:id/achievements/')
			.send(data)
			.then(() => {
				window.location.href = `/editor/${this.state.editor.id}`;
			})
			.catch((res) => {
				const error = res.body.error;
				this.setState({
					error,
					waiting: false
				});
			});
	}
	renderAchievements(unlocked) {
		return this.state.achievement.model.map((achievement) => {
			let achievementHTML;
			if (achievement.unlocked === unlocked) {
				achievementHTML = (
					<Achievement
						achievement={achievement}
						key={`${this.state.editor.id}${achievement.id}`}
						unlocked={unlocked}
					/>
				);
			}
			return achievementHTML;
		});
	}
	render() {
		const achievements = this.renderAchievements(true);
		const locked = this.renderAchievements(false);

		let rankUpdate;
		if (this.state.editor.authenticated) {
			rankUpdate = (
				<form
					className="form-horizontal"
					id="rankSelectForm"
					method="post"
				>
					<div className="row dnd-container form-group">
						<DragAndDrop name="rank1"/>
						<DragAndDrop name="rank2"/>
						<DragAndDrop name="rank3"/>
					</div>
					<div className="form-group">
						<span>
							<button
								className="btn btn-default"
								type="submit"
							>
								update
							</button>
							<p
								style={{
									display: 'inline-block',
									marginLeft: '10px'
								}}
							>
								click badge to unset
							</p>
						</span>
					</div>
				</form>
			);
		}

		const STICKY_TOP_MARGIN = 64;
		return (
			<Row>
				<div className="col-md-10-offset-1">
					<div id="achievementsForm">
						<StickyContainer>
							<Sticky
								style={{
									background: 'white',
									flex: '1',
									marginTop: STICKY_TOP_MARGIN,
									zIndex: 10
								}}
								topOffset={-80}
							>
								{rankUpdate}
							</Sticky>
							<div style={{zIndex: 1}}>
								<div className="h1">Unlocked Achievements</div>
								{achievements}
								<div className="h1">Locked Achievements</div>
								{locked}
							</div>
						</StickyContainer>
					</div>
				</div>
			</Row>
		);
	}
}

EditorAchievementTab.displayName = 'EditorAchievementTab';
EditorAchievementTab.propTypes = {
	achievement: React.PropTypes.shape({
		model: React.PropTypes.array
	}).isRequired,
	editor: React.PropTypes.shape({
		authenticated: React.PropTypes.bool,
		id: React.PropTypes.number
	}).isRequired
};

export default EditorAchievementTab;
