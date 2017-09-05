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
import {debounceUpdateRevisionNote, submit} from './actions';
import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';

/**
 * Container component. The SubmissionSection component contains a button for
 * submitting the changes made on the entity editing form as a revision, and a
 * field for entering a note for this revision. It also displays any errors
 * encountered while submitting the revision to the server.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.errorText - A message to be displayed within the
 *        component in the case of an error.
 * @param {Function} props.onNoteChange - A function to be called when the
 *        revision note is changed.
 * @param {Function} props.onSubmitClick - A function to be called when the
 *        submit button is clicked.
 * @returns {ReactElement} React element containing the rendered
 *          SubmissionSection.
 */
function SubmissionSection({
	errorText,
	onNoteChange,
	onSubmit
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
				<Button bsStyle="success" onClick={onSubmit}>
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
	errorText: React.PropTypes.node.isRequired,
	onNoteChange: React.PropTypes.func.isRequired,
	onSubmit: React.PropTypes.func.isRequired,
	submissionUrl: React.PropTypes.string.isRequired
};

function mapStateToProps(rootState) {
	const state = rootState.get('submissionSection');
	return {
		errorText: state.get('submitError')
	};
}


function mapDispatchToProps(dispatch, {submissionUrl}) {
	return {
		onNoteChange: (event) =>
			dispatch(debounceUpdateRevisionNote(event.target.value)),
		onSubmit: () => dispatch(submit(submissionUrl))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SubmissionSection);
