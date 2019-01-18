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

import * as bootstrap from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';
import {hot} from 'react-hot-loader';


const {Button, Grid, Row} = bootstrap;

/**
 * Links to different pages
 */

function ErrorPage(props) {
	const {error} = props;
	let {detailedMessage} = error;

	if (typeof detailedMessage === 'string') {
		detailedMessage = [detailedMessage];
	}

	/*
	 * to-do: Adjust margins for error status title and message once image
	 * is added in
	 */
	return (
		<Grid className="text-center">
			<Row className="margin-bottom-6">
				<h1>{error.status}</h1>
			</Row>
			<Row className="margin-top-6 margin-bottom-1">
				<p className="lead">
					<b>{error.message}</b>
				</p>
			</Row>
			<div>
				{detailedMessage &&
					detailedMessage.map((message, idx) => (
						<Row key={`detailedMsg${idx}`}>
							<span>
								{message}
							</span>
						</Row>
					))
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
ErrorPage.displayName = 'ErrorPage';
ErrorPage.propTypes = {
	error: PropTypes.shape({
		detailedMessage: PropTypes.string,
		message: PropTypes.string,
		status: PropTypes.number
	}).isRequired
};

// Export as hot module (see https://github.com/gaearon/react-hot-loader)
export default hot(module)(ErrorPage);
