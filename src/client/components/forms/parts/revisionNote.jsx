/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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
const Input = require('react-bootstrap').Input;

const RevisionNote = React.createClass({
	displayName: 'revisionNoteComponent',
	propTypes: {
		backClick: React.PropTypes.func,
		nextClick: React.PropTypes.func,
		onSubmit: React.PropTypes.func,
		submitDisabled: React.PropTypes.bool,
		visible: React.PropTypes.bool
	},
	render() {
		'use strict';

		return (
			<div className={this.props.visible === false ? 'hidden' : ''}>
				<h2>Submit Revision</h2>
				<p className="lead">Finally, add this revision to an edit.</p>

				<div className="form-horizontal">
					<Input
						label="Revision Note"
						labelClassName="col-md-3"
						ref="note"
						rows="6"
						type="textarea"
						wrapperClassName="col-md-6"
					/>
				</div>

				<nav className="margin-top-1">
					<ul className="pager">
						<li className="previous">
							<a
								href="#"
								onClick={this.props.backClick}
							>
								<span
									aria-hidden="true"
									className="fa fa-angle-double-left"
								/>
								Back
							</a>
						</li>
						<li
							className={
								this.props.submitDisabled ?
								'next disabled' : 'next'
							}
						>
							<a
								href="#"
								onClick={this.props.onSubmit}
							>
								Submit
							</a>
						</li>
					</ul>
				</nav>
			</div>
		);
	}
});

module.exports = RevisionNote;
