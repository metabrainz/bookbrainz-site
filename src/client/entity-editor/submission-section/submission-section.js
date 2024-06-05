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

import {Alert, Button, Col, Form, OverlayTrigger, Row, Spinner, Tooltip} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import {connect} from 'react-redux';
import {debounceUpdateRevisionNote} from './actions';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';

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
 * @param {boolean} props.submitted - Boolean indicating if the form has been submitted
 *        (i.e. submit button clicked) to prevent submitting again
 * @returns {ReactElement} React element containing the rendered
 *          SubmissionSection.
 */
function SubmissionSection({
	errorText,
	formValid,
	note,
	onNoteChange,
	submitted
}) {
	const errorAlertClass =
		classNames('text-center', 'margin-top-1', {'d-none': !errorText});

	const editNoteLabel = (
		<span>
			Edit Note
			<span className="text-muted"> (optional)</span>
		</span>
	);

	const tooltip = (
		<Tooltip>
			Cite your sources or an explanation of your edit
		</Tooltip>
	);

	return (
		<div>
			<h2>
				Submit Your Edit
			</h2>
			<Row>
				<Col lg={{offset: 3, span: 6}}>
					<Form.Group>
						<Form.Label>
							{editNoteLabel}
							<OverlayTrigger delay={50} overlay={tooltip}>
								<FontAwesomeIcon
									className="margin-left-0-5"
									icon={faQuestionCircle}
								/>
							</OverlayTrigger>
						</Form.Label>
						<Form.Control as="textarea" defaultValue={note} rows="6" onChange={onNoteChange}/>
					</Form.Group>
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
					disabled={!formValid || submitted}
					type="submit"
					variant="success"
				>
					 {submitted &&
					<Spinner
						animation="border"
						aria-hidden="true"
						as="span"
						role="status"
						size="sm"
					/>}
					 {submitted ? ' Submit' : 'Submit'}
				</Button>
			</div>
			<div className={errorAlertClass}>
				<Alert variant="danger">Submission Error: {errorText}</Alert>
			</div>
		</div>
	);
}
SubmissionSection.displayName = 'SubmissionSection';
SubmissionSection.propTypes = {
	errorText: PropTypes.node.isRequired,
	formValid: PropTypes.bool.isRequired,
	note: PropTypes.node.isRequired,
	onNoteChange: PropTypes.func.isRequired,
	submitted: PropTypes.bool.isRequired
};

function mapStateToProps(rootState, {validate, identifierTypes, isMerge, formValid = false}) {
	const state = rootState.get('submissionSection');
	return {
		errorText: state.get('submitError'),
		formValid: formValid || (validate && validate(rootState, identifierTypes, isMerge)),
		note: state.get('note'),
		submitted: state.get('submitted')
	};
}


function mapDispatchToProps(dispatch) {
	return {
		onNoteChange: (event) =>
			dispatch(debounceUpdateRevisionNote(event.target.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(SubmissionSection);
