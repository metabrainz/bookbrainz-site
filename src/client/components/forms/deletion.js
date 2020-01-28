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
import {kebabCase as _kebabCase} from 'lodash';
import request from 'superagent-bluebird-promise';


const {Alert, Button, Col, Row, Panel} = bootstrap;

class EntityDeletionForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			error: null,
			waiting: false
		};

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(event) {
		event.preventDefault();

		this.setState({
			error: null,
			waiting: true
		});

		request.post(this.deleteUrl)
			.send()
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

		this.entityUrl = `/${_kebabCase(entity.type)}/${entity.bbid}`;
		this.deleteUrl = `${this.entityUrl}/delete/handler`;

		let errorComponent = null;
		if (this.state.error) {
			errorComponent =
				<Alert bsStyle="danger">{this.state.error}</Alert>;
		}

		const loadingComponent = this.state.waiting ? <LoadingSpinner/> : null;

		const footerComponent = (
			<span className="clearfix">
				<Button
					bsStyle="danger"
					className="pull-right"
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

		const headerComponent = <h3>Confirm Deletion</h3>;

		const entityName =
			entity.defaultAlias ? entity.defaultAlias.name : '(unnamed)';

		return (
			<div id="deletion-form">
				<h1>Delete Entity</h1>
				<Row className="margin-top-2">
					{loadingComponent}
					<Col md={6} mdOffset={3}>
						<form onSubmit={this.handleSubmit}>
							<Panel
								bsStyle="danger"
								footer={footerComponent}
								header={headerComponent}
							>
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
								</p>
								<p className="text-muted">
								We are currently working on the merging tool. If this {entity.type} is a duplicate,
								please edit it to add &quot;duplicate&quot; as a disambiguation to mark it to be merged.
								</p>

								<CustomInput
									ref={(ref) => this.note = ref}
									rows="5"
									type="textarea"
									wrapperClassName="margin-top-1"
								/>
								{errorComponent}
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
