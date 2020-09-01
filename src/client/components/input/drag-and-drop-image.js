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


/**
 * This class is derived from the React Component base class and renders
 * an image which supports drag and drop functionality.
 */
class DragAndDropImage extends React.Component {
	/**
	 * Binds the class methods to their respective data.
	 * @constructor
	 */
	constructor() {
		super();
		this.handleDragStart = this.handleDragStart.bind(this);
	}

	/**
	 * Transfers the data of the achievement badge component properties to the
	 * DragAndDrop event, which in turn transfers the data on handleDrop to that
	 * of the achievement badge which will be showcased on editor's
	 * public profile.
	 * @param {object} ev - Passed in the function to be initialized with data
	 * onDragStart.
	 */
	handleDragStart(ev) {
		const data = {
			id: this.props.achievementId,
			name: this.props.achievementName,
			src: this.props.src
		};
		ev.dataTransfer.setData('text', JSON.stringify(data));
	}

	/**
	 * Renders an image of a particular achievement badge, which can be dragged
	 * to set the user's publicly showcased achievements
	 * @returns {ReactElement} - The rendered image element.
	 */
	render() {
		return (
			<img
				draggable="true"
				height={this.props.height}
				src={this.props.src}
				onDragStart={this.handleDragStart}
			/>
		);
	}
}

DragAndDropImage.displayName = 'DragAndDropImage';
DragAndDropImage.propTypes = {
	achievementId: PropTypes.number.isRequired,
	achievementName: PropTypes.string.isRequired,
	height: PropTypes.string.isRequired,
	src: PropTypes.string.isRequired
};

export default DragAndDropImage;
