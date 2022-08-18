/*
 * Copyright (C) 2021  Akash Gupta
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
import React, {createRef, useCallback} from 'react';
import {getEntityKey, getEntityTable} from '../../../helpers/utils';
import CBReviewModal from './cbReviewModal';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityRelatedCollections from './related-collections';
import EntityReviews from './cb-review';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import {Rating} from 'react-simple-star-rating';


const {deletedEntityMessage, getEntityUrl, ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias} = entityHelper;
const {Col, Row} = bootstrap;

function SeriesAttributes({averageRating, series}) {
	if (series.deleted) {
		return deletedEntityMessage;
	}
	const sortNameOfDefaultAlias = getSortNameOfDefaultAlias(series);
	return (
		<div>
			<Row>
				<Col lg={3}>
					<dl>
						<dt>Sort Name</dt>
						<dd>{sortNameOfDefaultAlias}</dd>
					</dl>
				</Col>
				<Col lg={2}>
					<dl>
						<dt>Series Type</dt>
						<dd>{series.entityType}</dd>
					</dl>
				</Col>
				<Col lg={2}>
					<dl>
						<dt>Ordering Type</dt>
						<dd>{series.seriesOrderingType.label}</dd>
					</dl>
				</Col>
				<Col lg={2}>
					<dl>
						<dt>Total Items</dt>
						<dd>{series.seriesItems.length}</dd>
					</dl>
				</Col>
				<Col lg={3}>
					<dl>
						<dt>Ratings</dt>
						<dd>
							<Rating
								allowHalfIcon
								readonly
								allowHover={false}
								className="rating-stars"
								fillColor="#46433A"
								initialValue={averageRating}
								ratingValue={0}
								size={20}
								stars={5}
							/>
						</dd>
					</dl>
				</Col>
			</Row>
		</div>
	);
}
SeriesAttributes.displayName = 'SeriesAttributes';
SeriesAttributes.propTypes = {
	averageRating: PropTypes.number.isRequired,
	series: PropTypes.object.isRequired
};


function SeriesDisplayPage({entity, identifierTypes, user}) {
	const [showCBReviewModal, setShowCBReviewModal] = React.useState(false);
	const handleModalToggle = useCallback(() => {
		setShowCBReviewModal(!showCBReviewModal);
	}, [showCBReviewModal]);

	const reviewsRef = createRef();

	const handleUpdateReviews = useCallback(() => {
		reviewsRef.current.handleClick();
	}, [reviewsRef]);


	const urlPrefix = getEntityUrl(entity);
	const EntityTable = getEntityTable(entity.entityType);
	const entityKey = getEntityKey(entity.entityType);
	const propsForTable = {
		[entityKey]: entity.seriesItems,
		showAdd: false,
		showAddedAtColumn: false,
		showCheckboxes: false
	};
	return (
		<div>
			<CBReviewModal
				entityBBID={entity.bbid}
				entityName={entity.defaultAlias.name}
				entityType={entity.type}
				handleModalToggle={handleModalToggle}
				handleUpdateReviews={handleUpdateReviews}
				showModal={showCBReviewModal}
				userId={user?.id}
			/>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" lg={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Series}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col lg={10}>
					<EntityTitle
						entity={entity}
						handleModalToggle={handleModalToggle}
					/>
					<SeriesAttributes
						averageRating={entity.reviews?.reviews?.average_rating?.count || 0}
						series={entity}
					/>
				</Col>
			</Row>
			<EntityAnnotation entity={entity}/>

			{!entity.deleted &&
			<React.Fragment>
				<EntityTable {...propsForTable}/>
				<Row>
					<Col lg={8}>
						<EntityLinks
							entity={entity}
							identifierTypes={identifierTypes}
							urlPrefix={urlPrefix}
						/>
						<EntityRelatedCollections collections={entity.collections}/>
					</Col>
					<Col lg={4}>
						<EntityReviews
							entityBBID={entity.bbid}
							entityReviews={entity.reviews}
							entityType={entity.type}
							handleModalToggle={handleModalToggle}
							ref={reviewsRef}
						/>
					</Col>
				</Row>
			</React.Fragment>}
			<hr className="margin-top-d40"/>
			<EntityFooter
				bbid={entity.bbid}
				deleted={entity.deleted}
				entityType={entity.type}
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
				user={user}
			/>
		</div>
	);
}
SeriesDisplayPage.displayName = 'SeriesDisplayPage';
SeriesDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired
};
SeriesDisplayPage.defaultProps = {
	identifierTypes: []
};

export default SeriesDisplayPage;
