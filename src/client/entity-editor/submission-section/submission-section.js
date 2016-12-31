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

import {Alert, Button, Col, Input, Row} from 'react-bootstrap';
import {setSubmitError, updateRevisionNote} from './actions';
import React from 'react';
import _debounce from 'lodash.debounce';
import {connect} from 'react-redux';
import request from 'superagent-bluebird-promise';
import classNames from 'classnames';

function SubmissionSection({
	errorText,
	onNoteChange,
	onSubmitClick
}) {
	const errorAlertClass =
		classNames('text-center', 'margin-top-1', {hidden: !errorText});

	return (
		<div>
			<h2>
				Submit Your Revision
			</h2>
			<p className="text-muted">
				Enter a note describing what you&rsquo;ve done and what sources
				you used, and hit the submit button to finish editing
			</p>
			<form>
				<Row>
					<Col md={6} mdOffset={3}>
						<Input
							label="Revision Note"
							rows="6"
							type="textarea"
							onChange={onNoteChange}
						/>
					</Col>
				</Row>
			</form>
			<div className="text-center margin-top-1">
				<Button bsStyle="success" onClick={onSubmitClick}>
					Submit
				</Button>
			</div>
			<div className={errorAlertClass}>
				<Alert bsStyle="danger">Submission Error: {errorText}</Alert>
			</div>
		</div>
	);
}
SubmissionSection.displayName = 'SubmissionSection';
SubmissionSection.propTypes = {
	errorText: React.PropTypes.node,
	submissionUrl: React.PropTypes.string,
	onNoteChange: React.PropTypes.func,
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
	const state = rootState.get('submissionSection');
	return {
		onSubmitClick: () => submit(submissionUrl, rootState),
		errorText: state.get('submitError')
	};
}

const KEYSTROKE_DEBOUNCE_TIME = 250;
function mapDispatchToProps(dispatch) {
	const debouncedDispatch = _debounce(dispatch, KEYSTROKE_DEBOUNCE_TIME);
	return {
		onNoteChange: (event) =>
			debouncedDispatch(updateRevisionNote(event.target.value)),
		onSubmitError: (error) => dispatch(setSubmitError(error.message))
	};
}

function mergeProps(stateProps, dispatchProps, ownProps) {
	return Object.assign({}, ownProps, stateProps, dispatchProps, {
		onSubmitClick: () => stateProps.onSubmitClick()
			.catch((error) => dispatchProps.onSubmitError(error))
	});
}

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(
	SubmissionSection
);
