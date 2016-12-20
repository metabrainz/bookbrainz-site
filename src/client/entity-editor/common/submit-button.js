/*
 * Copyright (C) 2016  Ben Ockmore
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

import {Button} from 'react-bootstrap';

import React from 'react';
import {connect} from 'react-redux';
import request from 'superagent-bluebird-promise';
import {setSubmitError} from '../actions';

function SubmitButton({
	error,
	...rest
}) {
	const errorElement = error ? <span>{error}</span> : null;

	return (
		<div>
			<Button bsStyle="success" {...rest}>
				Submit
			</Button>
			{errorElement}
		</div>
	);
}
SubmitButton.displayName = 'SubmitButton';
SubmitButton.propTypes = {
	error: React.PropTypes.string
};

function submit(url, data) {
	return request.post(url).send(data)
		.promise()
		.then((response) => {
			if (!response.body) {
				window.location.replace('/login');
			}

			const redirectUrl = `/creator/${response.body.bbid}`;
			if (response.body.alert) {
				const alertParam = `?alert=${response.body.alert}`;
				window.location.href = `${redirectUrl}${alertParam}`;
			}
			else {
				window.location.href = redirectUrl;
			}
		});
}

function mapStateToProps(state, {url}) {
	return {
		onClick: () => submit(url, state)
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSubmitError: (error) => dispatch(setSubmitError(error.message))
	};
}

function mergeProps(stateProps, dispatchProps) {
	return {
		onClick: () => stateProps.onClick()
			.catch((error) => dispatchProps.onSubmitError(error))
	};
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	SubmitButton
);
