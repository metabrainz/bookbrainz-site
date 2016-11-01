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

const React = require('react');
const request = require('superagent-bluebird-promise');

const Alert = require('react-bootstrap').Alert;
const Button = require('react-bootstrap').Button;
const Input = require('react-bootstrap').Input;
const Panel = require('react-bootstrap').Panel;

const LoadingSpinner = require('../loading-spinner');

(() => {
	'use strict';

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
					const error = res.body.error;

					this.setState({
						error,
						waiting: false
					});
				});
		}

		render() {
			const entity = this.props.entity;

			this.entityUrl = `/${entity.type.toLowerCase()}/${entity.bbid}`;
			this.deleteUrl = `${this.entityUrl}/delete/handler`;

			let errorComponent = null;
			if (this.state.error) {
				errorComponent =
					(<Alert bsStyle="danger">{this.state.error}</Alert>);
			}

			const loadingComponent = this.state.waiting ?
				<LoadingSpinner/> :
				null;

			const footerComponent = (
				<span className="clearfix">
				<Button
					bsStyle="danger"
					className="pull-right"
					type="submit"
				>
					Delete
				</Button>
				<Button
					className="pull-right"
					href={this.entityUrl}
				>
					Cancel
				</Button>
			</span>

			);

			const headerComponent = (<h3>Confirm Deletion</h3>);

			const entityName = entity.defaultAlias ?
				entity.defaultAlias.name :
				'(unnamed)';

			return (
				<div className="row">
					{loadingComponent}
					<div className="col-md-6 col-md-offset-3">
						{errorComponent}
						<form
							onSubmit={this.handleSubmit}
						>
							<Panel
								bsStyle="danger"
								footer={footerComponent}
								header={headerComponent}
							>
								If you're sure that {entity.type} {entityName}
								should be deleted, please enter a revision note
								below and confirm deletion.

								<Input
									ref={(ref) => this.note = ref}
									rows="5"
									type="textarea"
									wrapperClassName="margin-top-1"
								/>
							</Panel>
						</form>
					</div>
				</div>
			);
		}
	}

	EntityDeletionForm.displayName = 'EntityDeletionForm';
	EntityDeletionForm.propTypes = {
		entity: React.PropTypes.object
	};

	module.exports = EntityDeletionForm;
})();
