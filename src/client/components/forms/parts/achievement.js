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

import DragAndDropImage from '../../input/drag-and-drop-image';
import PropTypes from 'prop-types';
import React from 'react';


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
					achievementId={this.state.achievement.id}
					achievementName={this.state.achievement.name}
					height="100px"
					src={this.state.achievement.badgeUrl}
					style={{zIndex: 2}}
				/>
			);
		}
		else {
			imgElement = (
				<img
					alt={this.state.achievement.name}
					height="100px"
					src={this.state.achievement.badgeUrl}
					style={{zIndex: 2}}
				/>
			);
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
	achievement: PropTypes.shape({
		badgeUrl: PropTypes.string,
		description: PropTypes.string,
		name: PropTypes.string
	}).isRequired,
	unlocked: PropTypes.bool
};
Achievement.defaultProps = {
	unlocked: false
};

export default Achievement;
