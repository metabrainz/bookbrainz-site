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
				error: `We require users to leave a note explaining the reasons why they are deleting an entity.
				Please provide an explanation in the text area above.`,
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
			.catch((res) => {
				const {error} = res.body;

				this.setState({
					error,
					waiting: false
				});
			});
	}

	render() {
		const {entity} = this.props;
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
					className="float-end"
					disabled={!hasNote}
					type="submit"
					variant="danger"
				>
					<FontAwesomeIcon icon={faTrashAlt}/> Delete
				</Button>
				<Button
					className="float-end"
					href={this.entityUrl}
					variant="secondary"
				>
					<FontAwesomeIcon icon={faTimesCircle}/> Cancel
				</Button>
			</span>
		);

		const entityName =
			entity.defaultAlias ? entity.defaultAlias.name : '(unnamed)';

		const noteLabel = (
			<ValidationLabel error={!hasNote}>
				Note
			</ValidationLabel>
		);

		const deletionTooltip = (
			<Tooltip>
				Please explain why you are deleting this entity. This is required.
			</Tooltip>
		);

		return (
			<div id="deletion-form">
				<h1>Delete Entity</h1>
				<Row className="margin-top-2">
					{loadingComponent}
					<Col lg={{offset: 3, span: 6}}>
						<form onSubmit={this.handleSubmit}>
							<Card bg="danger">
								<Card.Header as="h4">
									Confirm Deletion
								</Card.Header>
								<Card.Body>

									<Alert variant="warning">
										<h4>
											<FontAwesomeIcon icon={faExclamationTriangle}/>&nbsp;
											You’re about to delete the {entity.type} {entityName}.
										</h4>
										<span style={{fontSize: '1.3em'}}>Edit the entity or merge duplicates rather than delete !</span>
									</Alert>
									<p>
									As a general principle, if you can solve an issue with non-destructive edits,
									that&apos;s preferable to a removal. That way the unique identifier of the entity is preserved.
										<br/>
									In case of merged entities, the old identifier will forward to the entity it is merged into.
									</p>
									<p>If you are certain it should be deleted, please enter a
									revision note below to explain why and confirm the deletion.
									If you are not sure, you can get feedback from the community&nbsp;
									<a
										href="//community.metabrainz.org/c/bookbrainz"
										rel="noopener noreferrer"
										target="_blank"
									>
										on our forums
									</a>
									&nbsp;or on our&nbsp;
									<a
										href="//kiwiirc.com/nextclient/irc.libera.chat/?#bookbrainz"
										rel="noopener noreferrer"
										target="_blank"
									>
										IRC channel
									</a>.
									</p>
									<p className="text-muted">
									If this {entity.type} is a duplicate, click <a href={`/merge/add/${entity.bbid}`}>this link</a>
									&nbsp;to select it to be merged instead.
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
											<Form.Text muted>* A note is required</Form.Text>
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
	entity: PropTypes.object.isRequired
};

export default EntityDeletionForm;
