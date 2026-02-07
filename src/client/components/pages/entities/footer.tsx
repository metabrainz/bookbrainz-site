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
import {faCodeBranch, faGripVertical, faHistory, faPencilAlt, faTimes} from '@fortawesome/free-solid-svg-icons';
import AddToCollectionModal from '../parts/add-to-collection-modal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import React from 'react';


const {formatDate} = utilsHelper;
const {
	Alert, Button, Col, Row
} = bootstrap;

interface Message {
	text: string | null;
	type: 'danger' | 'success' | 'warning' | 'info';
}

interface EntityFooterProps {
	bbid: string;
	deleted?: boolean;
	entityType: string;
	entityUrl: string;
	lastModified: string | Date;
	user: {
		id: number;
		[key: string]: any;
	};
}

interface EntityFooterState {
	message: Message;
	showModal: boolean;
}

class EntityFooter extends React.Component<EntityFooterProps, EntityFooterState> {
	static displayName = 'EntityFooter';

	static defaultProps = {
		deleted: false
	};

	constructor(props: EntityFooterProps) {
		super(props);
		this.state = {
			message: {
				text: null,
				type: 'info'
			},
			showModal: false
		};

		this.onCloseModal = this.onCloseModal.bind(this);
		this.handleShowModal = this.handleShowModal.bind(this);
		this.handleAlertDismiss = this.handleAlertDismiss.bind(this);
		this.closeModalAndShowMessage = this.closeModalAndShowMessage.bind(this);
	}

	onCloseModal(): void {
		this.setState({showModal: false});
	}

	handleShowModal(): void {
		if (this.props.user) {
			this.setState({showModal: true});
		}
		else {
			this.setState({
				message: {
					text: 'You need to be logged in',
					type: 'danger'
				}
			});
		}
	}

	closeModalAndShowMessage(message: Message): void {
		this.setState({
			message,
			showModal: false
		});
	}

	handleAlertDismiss(): void {
		this.setState({message: {text: null, type: 'info'}});
	}

	render(): JSX.Element {
		return (
			<div>
				{
					this.props.user ?
						<div>
							<AddToCollectionModal
								bbids={[this.props.bbid]}
								closeModalAndShowMessage={this.closeModalAndShowMessage}
								entityType={this.props.entityType}
								handleCloseModal={this.onCloseModal}
								show={this.state.showModal}
								userId={this.props.user.id}
							/>
						</div> : null
				}
				{
					this.state.message.text ?
						<Alert dismissible variant={this.state.message.type} onClose={this.handleAlertDismiss}>{this.state.message.text}</Alert> :
						 null

				}
				<Row>
					<Col className="text-center" lg={{offset: 1, span: 10}}>
						<Button
							className="footer-button"
							disabled={this.props.deleted}
							href={`${this.props.entityUrl}/edit`}
							title="Edit Entity"
							variant="warning"
						>
							<FontAwesomeIcon icon={faPencilAlt}/>
							&nbsp;Edit
						</Button>
						<Button
							className="footer-button"
							href={`${this.props.entityUrl}/revisions`}
							title="Revision History"
							variant="primary"
						>
							<FontAwesomeIcon icon={faHistory}/>
							&nbsp;History
						</Button>
						<Button
							className="footer-button"
							disabled={this.props.deleted}
							href={`${this.props.entityUrl}/delete`}
							title="Delete Entity"
							variant="danger"
						>
							<FontAwesomeIcon icon={faTimes}/>
							&nbsp;Delete
						</Button>
						<Button
							className="footer-button"
							href={`/merge/add/${this.props.bbid}`}
							title="Select entity for merging"
							variant="secondary"
						>
							<FontAwesomeIcon
								flip="vertical"
								icon={faCodeBranch}
							/>
							&nbsp;Merge
						</Button>
						<Button
							className="footer-button"
							href="#"
							title="Add To Collection"
							variant="primary"
							onClick={this.handleShowModal}
						>
							<FontAwesomeIcon icon={faGripVertical}/>
							&nbsp;Add to collection
						</Button>
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

export default EntityFooter;
