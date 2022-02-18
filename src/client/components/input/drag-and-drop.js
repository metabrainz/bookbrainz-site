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
import PropTypes from 'prop-types';
import React from 'react';


const {Card, Form} = bootstrap;

class DragAndDrop extends React.Component {
	constructor() {
		super();
		this.handleClick = this.handleClick.bind(this);
		this.handleDragOver = this.handleDragOver.bind(this);
		this.handleDrop = this.handleDrop.bind(this);
		this.state = {
			achievement: {
				name: 'drag badge to set',
				src: '/images/blankbadge.svg'
			}
		};
	}

	handleClick(ev) {
		ev.preventDefault();
		this.setState({
			achievement: {
				name: 'drag badge to set',
				src: '/images/blankbadge.svg'
			}
		});
	}

	handleDragOver(ev) {
		ev.preventDefault();
	}

	addChild(data) {
		this.setState({achievement: data});
	}

	handleDrop(ev) {
		ev.preventDefault();
		let data;

		try {
			data = JSON.parse(ev.dataTransfer.getData('text'));
		}
		catch (err) {
			return;
		}
		this.addChild(data);
	}

	render() {
		return (
			<Card
				bg="light"
				onClick={this.handleClick}
				onDragOver={this.handleDragOver}
				onDrop={this.handleDrop}
			>
				<Card.Img
					className="mt-4"
					height={100}
					src={this.state.achievement.src}
					variant="top"
				/>
				<Card.Body className="text-center">
					<Form.Group>
						<Form.Control
							name={this.props.name}
							type="hidden"
							value={this.state.achievement.id}
						/>
					</Form.Group>
					<div className="h3">
						{this.state.achievement.name}
					</div>
				</Card.Body>
			</Card>
		);
	}
}

DragAndDrop.displayName = 'DragAndDrop';
DragAndDrop.propTypes = {
	name: PropTypes.string.isRequired
};

export default DragAndDrop;
