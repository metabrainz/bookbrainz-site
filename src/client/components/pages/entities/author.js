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
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityTitle from './title';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import {kebabCase as _kebabCase} from 'lodash';
import {labelsForAuthor} from '../../../helpers/utils';


const {deletedEntityMessage, extractAttribute, getTypeAttribute, getEntityUrl,
	ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias, transformISODateForDisplay} = entityHelper;
const {Button, Col, Row} = bootstrap;

function AuthorAttributes({author}) {
	if (author.deleted) {
		return deletedEntityMessage;
	}
	const type = getTypeAttribute(author.authorType).data;
	const gender = extractAttribute(author.gender, 'name');
	const beginArea = extractAttribute(author.beginArea, 'name');
	const endArea = extractAttribute(author.endArea, 'name');
	const beginDate = transformISODateForDisplay(extractAttribute(author.beginDate));
	const endDate = transformISODateForDisplay(extractAttribute(author.endDate));
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(author);

	const isGroup = type === 'Group';
	const {
		beginDateLabel,
		beginAreaLabel,
		endDateLabel,
		endAreaLabel
	} = labelsForAuthor(isGroup);
	const showGender = !isGroup;
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
						{showGender &&
							<React.Fragment>
								<dt>Gender</dt>
								<dd>{gender}</dd>
							</React.Fragment>
						}
					</dl>
				</Col>
				<Col md={3}>
					<dl>
						<dt>{beginDateLabel}</dt>
						<dd>{beginDate}</dd>
						<dt>{beginAreaLabel}</dt>
						<dd>{beginArea}</dd>
					</dl>
				</Col>
				{
					author.ended &&
					<Col md={3}>
						<dl>
							<dt>{endDateLabel}</dt>
							<dd>{endDate}</dd>
							<dt>{endAreaLabel}</dt>
							<dd>{endArea}</dd>
						</dl>
					</Col>
				}
			</Row>
		</div>
	);
}
AuthorAttributes.displayName = 'AuthorAttributes';
AuthorAttributes.propTypes = {
	author: PropTypes.object.isRequired
};


class AuthorDisplayPage extends React.Component {
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
		this.setState({showModal: true});
	}

	render() {
		const urlPrefix = getEntityUrl(this.props.entity);
		return (
			<div>
				<div>
					<AddToCollectionModal
						closeCallback={this.onCloseModal}
						entities={[this.props.entity]}
						entityType="Author"
						show={this.state.showModal}
					/>
				</div>
				<Row className="entity-display-background">
					<Col className="entity-display-image-box text-center" md={2}>
						<EntityImage
							backupIcon={ENTITY_TYPE_ICONS.Author}
							deleted={this.props.entity.deleted}
							imageUrl={this.props.entity.imageUrl}
						/>
					</Col>
					<Col md={10}>
						<EntityTitle entity={this.props.entity}/>
						<AuthorAttributes author={this.props.entity}/>
					</Col>
				</Row>
				{!this.props.entity.deleted &&
				<React.Fragment>
					<EntityLinks
						entity={this.props.entity}
						identifierTypes={this.props.identifierTypes}
						urlPrefix={urlPrefix}
					/>
					<Button
						bsStyle="success"
						className="margin-top-d15"
						href={`/work/create?${_kebabCase(this.props.entity.type)}=${this.props.entity.bbid}`}
					>
						<FontAwesomeIcon className="margin-right-0-5" icon="plus"/>Add Work
					</Button>
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
AuthorDisplayPage.displayName = 'AuthorDisplayPage';
AuthorDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array
};
AuthorDisplayPage.defaultProps = {
	identifierTypes: []
};

export default AuthorDisplayPage;
