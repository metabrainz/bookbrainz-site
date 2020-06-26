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
import * as entityHelper from '../../../helpers/entity';
import AddToCollectionModal from '../parts/add-to-collection-modal';
import EditionTable from './edition-table';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import React from 'react';


const {deletedEntityMessage, getTypeAttribute, getEntityUrl, ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias} = entityHelper;
const {Col, Row} = bootstrap;

function EditionGroupAttributes({editionGroup}) {
	if (editionGroup.deleted) {
		return deletedEntityMessage;
	}
	const type = getTypeAttribute(editionGroup.editionGroupType).data;
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(editionGroup);
	return (
		<div>
			<Row>
				<Col md={3}>
					<dl>
						<dt>Sort Name</dt>
						<dd>{sortNameOfDefaultAlias}</dd>
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>Type</dt>
						<dd>{type}</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
EditionGroupAttributes.displayName = 'EditionGroupAttributes';
EditionGroupAttributes.propTypes = {
	editionGroup: PropTypes.object.isRequired
};

// eslint-disable-next-line react/prefer-stateless-function
class EditionGroupDisplayPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModal: false
		};

		this.onCloseModal = this.onCloseModal.bind(this);
		this.onShowModal = this.onShowModal.bind(this);
	}

	onCloseModal() {
		this.setState({showModal: false});
	}

	onShowModal() {
		if (this.props.user) {
			this.setState({showModal: true});
		}
		else {
			window.location.href = '/auth';
		}
	}

	render() {
		const urlPrefix = getEntityUrl(this.props.entity);
		return (
			<div>
				<div>
					<AddToCollectionModal
						closeCallback={this.onCloseModal}
						entities={[this.props.entity]}
						entityType="EditionGroup"
						show={this.state.showModal}
						user={this.props.user}
					/>
				</div>
				<Row className="entity-display-background">
					<Col className="entity-display-image-box text-center" md={2}>
						<EntityImage
							backupIcon={ENTITY_TYPE_ICONS.EditionGroup}
							deleted={this.props.entity.deleted}
							imageUrl={this.props.entity.imageUrl}
						/>
					</Col>
					<Col md={10}>
						<EntityTitle entity={this.props.entity}/>
						<EditionGroupAttributes editionGroup={this.props.entity}/>
					</Col>
				</Row>
				{!this.props.entity.deleted &&
				<React.Fragment>
					<EditionTable editions={this.props.entity.editions} entity={this.props.entity}/>
					<EntityLinks
						entity={this.props.entity}
						identifierTypes={this.props.identifierTypes}
						urlPrefix={urlPrefix}
					/>
				</React.Fragment>}
				<hr className="margin-top-d40"/>
				<EntityFooter
					bbid={this.props.entity.bbid}
					deleted={this.props.entity.deleted}
					entityUrl={urlPrefix}
					handleAddToCollection={this.onShowModal}
					lastModified={this.props.entity.revision.revision.createdAt}
				/>
			</div>
		);
	}
}
EditionGroupDisplayPage.displayName = 'EditionGroupDisplayPage';
EditionGroupDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object
};
EditionGroupDisplayPage.defaultProps = {
	identifierTypes: [],
	user: null
};

export default EditionGroupDisplayPage;
