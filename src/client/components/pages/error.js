/*
 * Copyright (C) 2016  Daniel Hsing
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
const Button = require('react-bootstrap').Button;

/**
 * Links to different pages
 */

class ErrorPage extends React.Component {

	render() {
		const {error} = this.props;
		let detailedMessage = error.detailedMessage;
		if (typeof detailedMessage === 'string') {
			detailedMessage = [detailedMessage];
		}

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
				<h1>{error.status}</h1>
				<b
					style={{
						marginTop: '1.5em',
						fontSize: '1.2em',
						marginBottom: '1em'
					}}
				>
					{error.message}
				</b>
				{Boolean(detailedMessage) &&
					detailedMessage.map((message, idx) =>
						<span
							key={`detailedMsg${idx}`}
							style={{marginTop: '0.3em'}}
						>
							{message}
						</span>
					)
				}
				<div
					style={{marginTop: '1em'}}
				>
					<Button
						bsSize="small"
						bsStyle="link"
						href="/"
					>
						Return to Main Page
					</Button>
				</div>
			</div>
		);
	}
}
ErrorPage.displayName = 'ErrorPage';
ErrorPage.propTypes = {
	error: React.PropTypes.shape({
		message: React.PropTypes.string,
		status: React.PropTypes.number,
		detailedMessage: React.PropTypes.string
	})
};

module.exports = ErrorPage;
