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
const bootstrap = require('react-bootstrap');

/**
 * Links to different pages
 */

class ErrorPage extends React.Component {

	render() {
		const {error} = this.props;
		console.log(error);

		return (
			<div>
				<h1>{error.message}</h1>
				<h2>{error.status}</h2>
			</div>
		);
	}
}
ErrorPage.displayName = 'ErrorPage';
ErrorPage.propTypes = {
	error: React.PropTypes.shape({
		message: React.PropTypes.string,
		status: React.PropTypes.number
	})
};

module.exports = ErrorPage;
