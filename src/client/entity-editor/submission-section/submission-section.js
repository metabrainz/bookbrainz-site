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

import {Alert, Button} from 'react-bootstrap';
import {setSubmitError, updateRevisionNote} from './actions';
import React from 'react';
import {connect} from 'react-redux';
import request from 'superagent-bluebird-promise';

function SubmissionSection({
	error,
	onSubmitClick
}) {
	return (
		<div>
			<div className="text-center margin-top-1">
				<Button bsStyle="success" onClick={onSubmitClick}>
					Submit
				</Button>
			</div>
			<div className="text-center margin-top-1">
				<Alert bsStyle="error">{error}</Alert>
			</div>
		</div>
	);
}
SubmissionSection.displayName = 'CreatorSection';
SubmissionSection.propTypes = {
	error: React.PropTypes.node,
	submissionUrl: React.PropTypes.string,
	onSubmitClick: React.PropTypes.func
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

function mapStateToProps(rootState, {submissionUrl}) {
	const state = rootState.get('creatorSection');
	return {
		onSubmitClick: () => submit(submissionUrl, rootState),
		error: state.get('submitError')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSubmitError: (error) => dispatch(setSubmitError(error.message))
	};
}

function mergeProps(stateProps, dispatchProps) {
	return {
		onSubmitClick: () => stateProps.onSubmitClick()
			.catch((error) => dispatchProps.onSubmitError(error))
	};
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	SubmissionSection
);
