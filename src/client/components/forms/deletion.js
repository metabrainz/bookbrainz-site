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
import CustomInput from '../../input';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LoadingSpinner from '../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import ValidationLabel from '../../entity-editor/common/validation-label';
import {kebabCase as _kebabCase} from 'lodash';
import request from 'superagent';


const {Alert, Button, Col, Row, Panel} = bootstrap;

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
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;

		const hasNote = note && note.length;
		const footerComponent = (
			<span className="clearfix">
				<Button
					bsStyle="danger"
					className="pull-right"
					disabled={!hasNote}
					type="submit"
				>
					<FontAwesomeIcon icon="trash-alt"/> Delete
				</Button>
				<Button
					className="pull-right"
					href={this.entityUrl}
				>
					<FontAwesomeIcon icon="times-circle"/> Cancel
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

		return (
			<div id="deletion-form">
				<h1>Delete Entity</h1>
				<Row className="margin-top-2">
					{loadingComponent}
					<Col md={6} mdOffset={3}>
						<form onSubmit={this.handleSubmit}>
							<Panel
								bsStyle="danger"
							>
								<Panel.Heading>
									<Panel.Title componentClass="h3">
										Confirm Deletion
									</Panel.Title>
								</Panel.Heading>
								<Panel.Body>

									<Alert bsStyle="warning">
										<h4>
											<FontAwesomeIcon icon="exclamation-triangle"/>&nbsp;
											You’re about to delete the {entity.type} {entityName}.
										</h4>
										<p style={{fontSize: '1.3em'}}>Edit the entity or merge duplicates rather than delete !</p>
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
										href="//webchat.freenode.net/?channels=#metabrainz"
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
									<CustomInput
										help="* A note is required"
										label={noteLabel}
										rows="5"
										tooltipText="Please explain why you are deleting this entity. This is required."
										type="textarea"
										value={note}
										wrapperClassName="margin-top-1"
										onChange={this.handleNoteChange}
									/>
									{errorComponent}
								</Panel.Body>
								<Panel.Footer>
									{footerComponent}
								</Panel.Footer>
							</Panel>
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
