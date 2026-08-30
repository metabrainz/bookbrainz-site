/*
 * Copyright (C) 2016  Sean Burke
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
import {Trans, withTranslation} from 'react-i18next';
import {faExclamationTriangle, faQuestionCircle, faTimesCircle, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LoadingSpinner from '../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from '../../entity-editor/common/validation-label';
import {kebabCase as _kebabCase} from 'lodash';
import request from 'superagent';


const {Alert, Button, Col, Form, Row, OverlayTrigger, Tooltip, Card} = bootstrap;

class EntityDeletionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			note: null,
			waiting: false
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleNoteChange = this.handleNoteChange.bind(this);
	}

	handleNoteChange(event) {
		this.setState({note: event.target.value});
	}

	handleSubmit(event) {
		const {note} = this.state;
		event.preventDefault();

		if (!note || !note.length) {
			this.setState({
				error: this.props.t('pages.entity.deleteNoteRequiredError'),
				waiting: false
			});
			return;
		}
		this.setState({
			error: null,
			waiting: true
		});
		request.post(this.deleteUrl)
			.send({note})
			.then(() => {
				window.location.href = this.entityUrl;
			})
			.catch((err) => {
				const {error: erroMessage} = err?.response?.body;
				const statusText = err?.message ?? `Error ${err?.status}`;
				this.setState({
					error: `${statusText}: ${erroMessage}`,
					waiting: false
				});
			});
	}

	render() {
		const {entity, t: translate} = this.props;
		const {note} = this.state;

		this.entityUrl = `/${_kebabCase(entity.type)}/${entity.bbid}`;
		this.deleteUrl = `${this.entityUrl}/delete/handler`;

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert variant="danger">{this.state.error}</Alert>;
		}

		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;

		const hasNote = note && note.length;
		const footerComponent = (
			<span className="clearfix">
				<Button
					className="float-right"
					disabled={!hasNote}
					type="submit"
					variant="danger"
				>
					<FontAwesomeIcon icon={faTrashAlt}/> {translate('common.button.delete')}
				</Button>
				<Button
					className="float-right"
					href={this.entityUrl}
					variant="secondary"
				>
					<FontAwesomeIcon icon={faTimesCircle}/> {translate('common.button.cancel')}
				</Button>
			</span>
		);

		const entityName =
			entity.defaultAlias ? entity.defaultAlias.name : translate('common.unnamed');

		const noteLabel = (
			<ValidationLabel error={!hasNote}>
				{translate('common.note')}
			</ValidationLabel>
		);

		const deletionTooltip = (
			<Tooltip>
				{translate('pages.entity.deletionTooltip')}
			</Tooltip>
		);

		return (
			<div id="deletion-form">
				<h1>{translate('pages.entity.deleteEntity')}</h1>
				<Row className="margin-top-2">
					{loadingComponent}
					<Col lg={{offset: 3, span: 6}}>
						<form onSubmit={this.handleSubmit}>
							<Card bg="danger">
								<Card.Header as="h4">
									{translate('common.confirmDeletion')}
								</Card.Header>
								<Card.Body>

									<Alert variant="warning">
										<h4>
											<FontAwesomeIcon icon={faExclamationTriangle}/>&nbsp;
											{translate('pages.entity.aboutToDeleteNotice', {name: entityName, type: entity.type})}
										</h4>
										<span style={{fontSize: '1.3em'}}>{translate('pages.entity.preferEditNotice')}</span>
									</Alert>
									<p>
										{translate('pages.entity.deletionGeneralPrinciple')}
									</p>
									<p>
										<Trans
											components={{
												forumsLink: (
													<a
														href="//community.metabrainz.org/c/bookbrainz"
														rel="noopener noreferrer"
														target="_blank"
													/>
												),
												ircLink: (
													<a
														href="//kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz"
														rel="noopener noreferrer"
														target="_blank"
													/>
												)
											}}
											i18nKey="pages.entity.deletionCertainNotice"
										/>
									</p>
									<p className="text-muted">
										<Trans
											components={{
												mergeLink: <a href={`/merge/add/${entity.bbid}`}/>
											}}
											i18nKey="pages.entity.deletionDuplicateNotice"
											values={{type: entity.type}}
										/>
									</p>
									<hr/>
									<Form.Group>
										<Form.Label>
											{noteLabel}
											<OverlayTrigger
												delay={50}
												overlay={deletionTooltip}
												placement="right"
											>
												<FontAwesomeIcon
													className="margin-left-0-5"
													icon={faQuestionCircle}
												/>
											</OverlayTrigger>
										</Form.Label>
										<div className="margin-top-1">
											<Form.Control
												as="textarea"
												rows="5"
												value={note}
												onChange={this.handleNoteChange}
											/>
											<Form.Text muted>{translate('pages.entity.noteIsRequired')}</Form.Text>
										</div>
									</Form.Group>
									{errorComponent}
								</Card.Body>
								<Card.Footer>
									{footerComponent}
								</Card.Footer>
							</Card>
						</form>
					</Col>
				</Row>
			</div>
		);
	}
}

EntityDeletionForm.displayName = 'EntityDeletionForm';
EntityDeletionForm.propTypes = {
	entity: PropTypes.object.isRequired,
	// eslint-disable-next-line id-length
	t: PropTypes.func.isRequired
};

export default withTranslation()(EntityDeletionForm);
