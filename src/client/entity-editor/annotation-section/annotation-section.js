/*
 * Copyright (C) 2020 Nicolas Pelletier
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

import {Col, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {convertMapToObject, formatDate} from '../../helpers/utils';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {debounceUpdateAnnotation} from './actions';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';

/**
 * Container component. The AnnotationSection component contains a
 * field for entering or modifying annotations for this entity.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.annotation - The annotation object containing
 *        its content and lastRevision info
 * @param {Function} props.onAnnotationChange - A function to be called when the
 *        annotation is changed.
 * @returns {ReactElement} React element containing the rendered
 *          AnnotationSection.
 */
function AnnotationSection({
	annotation: immutableAnnotation,
	onAnnotationChange,
	isUnifiedForm
}) {
	const {t: translate} = useTranslation('entityEditor');
	const annotation = convertMapToObject(immutableAnnotation);
	const annotationLabel = (
		<span>
			{translate('annotationSection.label')}
			<span className="text-muted"> {translate('annotationSection.optional')}</span>
		</span>
	);

	const tooltip = (
		<Tooltip>
			{translate('annotationSection.tooltip')}
		</Tooltip>
	);
	const lgCol = {offset: 3, span: 6};
	if (isUnifiedForm) {
		lgCol.offset = 0;
	}
	const heading = <h2> {translate('annotationSection.heading')}</h2>;
	return (
		<div>
			{!isUnifiedForm && heading}
			<Row>
				<Col lg={lgCol}>
					<Form.Group>
						<Form.Label>
							{annotationLabel}
							<OverlayTrigger delay={50} overlay={tooltip}>
								<FontAwesomeIcon
									className="margin-left-0-5"
									icon={faQuestionCircle}
								/>
							</OverlayTrigger>
						</Form.Label>
						<Form.Control
							as="textarea"
							defaultValue={annotation.content}
							rows="4"
							onChange={onAnnotationChange}
						/>
					</Form.Group>
					{
						annotation && annotation.lastRevision &&
						<p className="small text-muted">
							{translate('annotationSection.lastModified', {
								date: formatDate(new Date(annotation.lastRevision.createdAt))
							})}
						</p>
					}
					<p className="text-muted">
						{translate('annotationSection.helpText')}
						<b> {translate('annotationSection.copyrightWarning')}</b>
						{' '}
						{translate('annotationSection.openLicenseNoticePre')}
						<a href="https://musicbrainz.org/doc/About/Data_License">
							{translate('annotationSection.openLicenseNoticeLink')}
						</a>
						{translate('annotationSection.openLicenseNoticePost')}
					</p>
				</Col>
			</Row>
		</div>
	);
}
AnnotationSection.displayName = 'AnnotationSection';
AnnotationSection.propTypes = {
	annotation: PropTypes.object.isRequired,
	isUnifiedForm: PropTypes.bool,
	onAnnotationChange: PropTypes.func.isRequired
};
AnnotationSection.defaultProps = {
	isUnifiedForm: false
};
function mapStateToProps(rootState) {
	return {
		annotation: rootState.get('annotationSection')
	};
}


function mapDispatchToProps(dispatch) {
	return {
		onAnnotationChange: (event) =>
			dispatch(debounceUpdateAnnotation(event.target.value))
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationSection);
