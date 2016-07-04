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

const React = require('react');
const DragAndDropImage = require('../../input/dndSelector.jsx').DragAndDropImage;
(() => {
	'use strict';
	class Achievement extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				achievement: props.achievement,
				unlocked: props.unlocked
			};
		}
		render() {
			let imgElement;
			if (this.state.unlocked) {
				imgElement = (
					<DragAndDropImage
						height="100px"
						src={this.state.achievement.badgeUrl}
						achievementId={this.state.achievement.id}
						achievementName={this.state.achievement.name}
					/>
				);
			}
			else {
				imgElement = (
					<img
						height="100px"
						src={this.state.achievement.badgeUrl}
					/>
				)
			}
			return (
				<div className="row well">
					<div className="col-sm-2">
						{imgElement}
					</div>
					<div className="col-sm-8">
						<div className="h2">
							{this.state.achievement.name}
						</div>
						<p>{this.state.achievement.description}</p>
					</div>
				</div>
			);
		}
	}

	Achievement.displayName = 'achievement';

	Achievement.propTypes = {
		achievement: React.PropTypes.shape({
			badgeUrl: React.PropTypes.string,
			description: React.PropTypes.string,
			name: React.PropTypes.string
		})
	};

	module.exports = Achievement;
})();
