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
const Grid = require('react-bootstrap').Grid;
const Row = require('react-bootstrap').Row;

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
		/* to-do: Adjust margins for error status title and message once image
		   is added in
		*/
		return (
			<Grid className="text-center">
				<Row className="margin-bottom-6">
					<h1>{error.status}</h1>
				</Row>
				<Row className="margin-top-6 margin-bottom-2">
					<b style={{fontSize: '1.2em'}}>
						{error.message}
					</b>
				</Row>
				<div>
					{Boolean(detailedMessage) &&
						detailedMessage.map((message, idx) =>
							<Row key={`detailedMsg${idx}`}>
								<span>
									{message}
								</span>
							</Row>
						)
					}
				</div>
				<Row className="margin-top-1">
					<Button
						bsSize="small"
						bsStyle="link"
						href="/"
					>
						Return to Main Page
					</Button>
				</Row>
			</Grid>
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
