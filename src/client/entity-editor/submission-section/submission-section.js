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

import {Alert, Button, Col, Row} from 'react-bootstrap';
import {debounceUpdateRevisionNote, submit} from './actions';
import CustomInput from '../../input';
import PropTypes from 'prop-types';
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
 * @param {boolean} props.formValid - Boolean indicating if the form has been
 *        validated successfully or if it contains errors
 * @param {Function} props.onNoteChange - A function to be called when the
 *        revision note is changed.
 * @param {Function} props.onSubmit - A function to be called when the
 *        submit button is clicked.
 * @param {boolean} props.submitted - Boolean indicating if the form has been submitted
 *        (i.e. submit button clicked) to prevent submitting again
 * @returns {ReactElement} React element containing the rendered
 *          SubmissionSection.
 */
function SubmissionSection({
	errorText,
	formValid,
	onNoteChange,
	onSubmit,
	submitted
}) {
	const errorAlertClass =
		classNames('text-center', 'margin-top-1', {hidden: !errorText});

	const editNoteLabel = (
		<span>
			Edit Note
			<span className="text-muted"> (optional)</span>
		</span>
	);

	return (
		<div>
			<h2>
				Submit Your Edit
			</h2>
			<Row>
				<Col md={6} mdOffset={3}>
					<CustomInput
						label={editNoteLabel}
						rows="6"
						tooltipText="Cite your sources or an explanation of your edit"
						type="textarea"
						onChange={onNoteChange}
					/>
					<p className="text-muted">
						{`An edit note will make your entries more credible. Reply to one or more of these questions in the textarea below:
						- Where did you get your info from? A link is worth a thousand words.
						- What kind of information did you provide? If you made any changes, what are they and why?
						- Do you have any questions concerning the editing process you want to ask?`}
					</p>
				</Col>
			</Row>
			<div className="text-center margin-top-1">
				<Button
					bsStyle="success"
					disabled={!formValid || submitted}
					onClick={onSubmit}
				>
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
	errorText: PropTypes.node.isRequired,
	formValid: PropTypes.bool.isRequired,
	onNoteChange: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	submitted: PropTypes.bool.isRequired
};

function mapStateToProps(rootState, {validate, identifierTypes}) {
	const state = rootState.get('submissionSection');
	return {
		errorText: state.get('submitError'),
		formValid: validate(rootState, identifierTypes),
		submitted: state.get('submitted')
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
