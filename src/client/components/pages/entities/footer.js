/*
 * Copyright (C) 2017  Ben Ockmore
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
import * as utilsHelper from '../../../helpers/utils';
import AddToCollectionModal from '../parts/add-to-collection-modal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';


const {formatDate} = utilsHelper;
const {
	Alert, Button, ButtonGroup, Col, Row
} = bootstrap;

class EntityFooter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			showModal: false
		};

		this.onCloseModal = this.onCloseModal.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);
	}

	onCloseModal() {
		// eslint-disable-next-line no-console
		console.log('i am here');
		this.setState({showModal: false});
	}

	handleShowModal() {
		if (this.props.user) {
			this.setState({showModal: true});
		}
		else {
			this.setState({error: 'You need to be logged in'});
		}
	}

	/* eslint-disable react/jsx-handler-names */
	render() {
		return (
			<div>
				{
					this.props.user ?
						<div>
							<AddToCollectionModal
								bbids={[this.props.bbid]}
								entityType={this.props.entityType}
								show={this.state.showModal}
								userId={this.props.user.id}
								onCloseCallback={this.onCloseModal}
							/>
						</div> : null
				}
				{
					this.state.error ?
						<Alert bsStyle="danger">{this.state.error}</Alert> : null

				}
				<Row>
					<Col md={8} mdOffset={2}>
						<ButtonGroup justified>
							<Button
								bsStyle="warning"
								disabled={this.props.deleted}
								href={`${this.props.entityUrl}/edit`}
								title="Edit Entity"
							>
								<FontAwesomeIcon icon="pencil-alt"/>&nbsp;Edit
							</Button>
							<Button
								bsStyle="primary"
								href={`${this.props.entityUrl}/revisions`}
								title="Revision History"
							>
								<FontAwesomeIcon icon="history"/>&nbsp;History
							</Button>
							<Button
								bsStyle="danger"
								disabled={this.props.deleted}
								href={`${this.props.entityUrl}/delete`}
								title="Delete Entity"
							>
								<FontAwesomeIcon icon="times"/>&nbsp;Delete
							</Button>
							<Button
								bsStyle="default"
								href={`/merge/add/${this.props.bbid}`}
								title="Select entity for merging"
							>
								<FontAwesomeIcon flip="vertical" icon="code-branch"/>
								&nbsp;Merge
							</Button>
							<Button
								bsStyle="primary"
								href="#"
								title="Add To Collection"
								onClick={this.handleShowModal}
							>
								<FontAwesomeIcon icon="plus"/>
								&nbsp;Collection
							</Button>
						</ButtonGroup>
					</Col>
				</Row>
				<div className="text-center margin-top-d10">
					<dl>
						<dt>Last Modified</dt>
						<dd>{formatDate(new Date(this.props.lastModified))}</dd>
					</dl>
				</div>
			</div>
		);
	}
}
EntityFooter.displayName = 'EntityFooter';
EntityFooter.propTypes = {
	bbid: PropTypes.string.isRequired,
	deleted: PropTypes.bool,
	entityType: PropTypes.string.isRequired,
	entityUrl: PropTypes.string.isRequired,
	lastModified: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
	user: PropTypes.object.isRequired
};
EntityFooter.defaultProps = {
	deleted: false
};

export default EntityFooter;
