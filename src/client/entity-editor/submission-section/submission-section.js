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
import {useTranslation} from 'react-i18next';

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
	const {t: translate} = useTranslation('entityEditor');
	const errorAlertClass =
		classNames('text-center', 'margin-top-1', {'d-none': !errorText});

	const editNoteLabel = (
		<span>
			{translate('submissionSection.editNoteLabel')}
			<span className="text-muted"> {translate('optionalLabel')}</span>
		</span>
	);

	const tooltip = (
		<Tooltip>
			{translate('submissionSection.editNoteTooltip')}
		</Tooltip>
	);

	return (
		<div>
			<h2>
				{translate('submissionSection.heading')}
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
						{translate('submissionSection.editNoteHelp')}
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
					 {submitted ? ` ${translate('submissionSection.submitButton')}` : translate('submissionSection.submitButton')}
				</Button>
			</div>
			<div className={errorAlertClass}>
				<Alert variant="danger">{translate('submissionSection.submissionError', {errorText})}</Alert>
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
