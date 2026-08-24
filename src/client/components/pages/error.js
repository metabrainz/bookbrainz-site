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
import {useTranslation} from 'react-i18next';


const {Button, Container, Row} = bootstrap;

/**
 * Helper to translate detailed error messages, handling dynamic path variables.
 * @param {string} message - The message to translate.
 * @param {Function} translate - The translation function.
 * @returns {string} The translated message.
 */
function translateDetailedMessage(message, translate) {
	if (typeof message !== 'string') {
		return message;
	}

	const noContentPrefix = 'No content exists at the path requested: ';
	if (message.startsWith(noContentPrefix)) {
		const path = message.slice(noContentPrefix.length).trim();
		return translate('errors.No content exists at the path requested: {{path}}', {interpolation: {escapeValue: false}, path});
	}

	if (message.includes('You do not have permission to access the following path:')) {
		const lines = message.split('\n');
		const path = lines[lines.length - 1].trim();
		return translate('errors.You do not have permission to access the following path: {{path}}', {interpolation: {escapeValue: false}, path});
	}

	return translate(`errors.${message}`, {defaultValue: message});
}

/**
 * Links to different pages
 */

function ErrorPage(props) {
	const {error} = props;
	const {t: translate} = useTranslation();
	let {detailedMessage} = error;

	if (typeof detailedMessage === 'string') {
		detailedMessage = [detailedMessage];
	}

	/*
	 * to-do: Adjust margins for error status title and message once image
	 * is added in
	 */
	return (
		<Container className="text-center">
			<Row className="margin-bottom-6">
				<h1>{error.status}</h1>
			</Row>
			<Row className="margin-top-6 margin-bottom-1">
				<p className="lead">
					<b>{translate(`errors.${error.message}`, {defaultValue: error.message})}</b>
				</p>
			</Row>
			<div>
				{detailedMessage &&
					detailedMessage.map((message, idx) => (
						// eslint-disable-next-line react/no-array-index-key
						<Row key={`detailedMsg${idx}`}>
							<span>
								{translateDetailedMessage(message, translate)}
							</span>
						</Row>
					))
				}
			</div>
			<Row className="margin-top-1">
				<Button
					href="/"
					size="sm"
					variant="link"
				>
					{translate('common.button.returnToMain')}
				</Button>
			</Row>
		</Container>
	);
}
ErrorPage.displayName = 'ErrorPage';
ErrorPage.propTypes = {
	error: PropTypes.shape({
		detailedMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
		message: PropTypes.string,
		status: PropTypes.number
	}).isRequired
};

// Export as hot module (see https://github.com/gaearon/react-hot-loader)
export default hot(module)(ErrorPage);
