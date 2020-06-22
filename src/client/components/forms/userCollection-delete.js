/*
 * Copyright (C) 2020 Prabal Singh
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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import LoadingSpinner from '../loading-spinner';
import PropTypes from 'prop-types';
import React from 'react';
import request from 'superagent';


const {Alert, Button, Col, Row, Panel} = bootstrap;

class UserCollectionDeletionForm extends React.Component {
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
			.then((res) => {
				window.location.href = '/';
			}, (error) => {
				this.setState({
					error: 'Internal Error',
					waiting: false
				});
			});
	}

	render() {
		const {collection} = this.props;
		this.collectionUrl = `/collection/${collection.id}`;
		this.deleteUrl = `${this.collectionUrl}/delete/handler`;

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
					href={this.collectionUrl}
				>
					<FontAwesomeIcon icon="times-circle"/> Cancel
				</Button>
			</span>
		);

		const collectionName = collection.name;

		return (
			<div id="deletion-form">
				<h1>Delete Collection</h1>
				<Row className="margin-top-2">
					{loadingComponent}
					<Col md={8} mdOffset={2}>
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
											You’re about to delete the Collection - {collectionName}.
										</h4>
									</Alert>
									<p>
										Make sure you actually want to delete this Collection <br/>
										There is no way to undo this.
									</p>
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

UserCollectionDeletionForm.displayName = 'EntityDeletionForm';
UserCollectionDeletionForm.propTypes = {
	collection: PropTypes.object.isRequired
};

export default UserCollectionDeletionForm;
