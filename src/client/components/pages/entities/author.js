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
import React, {createRef, useCallback} from 'react';

import AverageRating from './average-ratings';
import CBReviewModal from './cbReviewModal';
import EditionTable from './edition-table';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityIdentifiers from './identifiers';
import EntityImage from './image';
import EntityLinks from './links';
import EntityRelatedCollections from './related-collections';
import EntityReviews from './cb-review';
import EntityTitle from './title';
import PropTypes from 'prop-types';
import WikipediaExtract from './wikipedia-extract';
import {kebabCase as _kebabCase} from 'lodash';
import {labelsForAuthor} from '../../../helpers/utils';


const {deletedEntityMessage, extractAttribute, getTypeAttribute, getEntityUrl,
	ENTITY_TYPE_ICONS, getSortNameOfDefaultAlias, transformISODateForDisplay,
	addAuthorsDataToWorks, getRelationshipTargetByTypeId} = entityHelper;
const {Col, Row, Tabs, Tab} = bootstrap;

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
	const averageRating = author.reviews?.reviews?.average_rating?.rating || 0;
	const reviewsCount = author.reviews?.reviews?.average_rating?.count || 0;

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
				<Col lg={3}>
					<dl>
						<dt>Sort Name</dt>
						<dd>{sortNameOfDefaultAlias}</dd>
						<AverageRating
							averageRatings={averageRating}
							reviewsCount={reviewsCount}
						/>
					</dl>
				</Col>
				<Col lg={3}>
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
				<Col lg={3}>
					<dl>
						<dt>{beginDateLabel}</dt>
						<dd>{beginDate}</dd>
						<dt>{beginAreaLabel}</dt>
						<dd>{beginArea}</dd>
					</dl>
				</Col>
				{
					author.ended &&
					<Col lg={3}>
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


function AuthorDisplayPage({entity, identifierTypes, user, wikipediaExtract}) {
	const [showCBReviewModal, setShowCBReviewModal] = React.useState(false);
	const handleModalToggle = useCallback(() => {
		setShowCBReviewModal(!showCBReviewModal);
	}, [showCBReviewModal]);

	const reviewsRef = createRef();

	const handleUpdateReviews = useCallback(() => {
		reviewsRef.current.handleClick();
	}, [reviewsRef]);

	const urlPrefix = getEntityUrl(entity);
	const editions = [];
	if (entity?.authorCredits) {
		entity.authorCredits.forEach((authorCredit) => {
			editions.push(...authorCredit.editions);
		});
	}
	const [activeTab, setActiveTab] = React.useState('overview');
	const handleTabSelect = useCallback((tabId) => {
		setActiveTab(tabId);
	  }, []);
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" lg={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Author}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col lg={10}>
					<EntityTitle
						entity={entity}
						handleModalToggle={handleModalToggle}
					/>
					<AuthorAttributes
						author={entity}
					/>
				</Col>
			</Row>
			{!entity.deleted && (
				<Tabs
					fill
					activeKey={activeTab}
					className="mb-3 w-100"
					id="entity-tabs"
					onSelect={handleTabSelect}
				>
					<Tab
						eventKey="overview"
						title="Overview"
					>
						<WikipediaExtract
							articleExtract={wikipediaExtract}
							entity={entity}
						/>
						<EntityAnnotation entity={entity} />
						<Row>
							<Col>
								<EntityIdentifiers
									entityUrl={urlPrefix}
									identifierTypes={identifierTypes}
									identifiers={entity.identifierSet && entity.identifierSet.identifiers}
								/>
							</Col>
						</Row>
					</Tab>
					<Tab
						eventKey="works"
						title="Works"
					>
						<EntityLinks
							buttonHref={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
							entity={entity}
							label="Work"
							relationshipTypeIds={[8, 1, 31, 62, 34, 35, 37]}
							urlPrefix={urlPrefix}
						/>
					</Tab>
					<Tab
						eventKey="translations"
						title="Translations"
					>
						<EntityLinks
							entity={entity}
							label="Translation"
							relationshipTypeIds={[9]}
							urlPrefix={urlPrefix}
						/>
					</Tab>
					<Tab
						eventKey="editions"
						title="Editions"
					>
						<EditionTable editions={editions} entity={entity} />
					</Tab>
					<Tab
						eventKey="relationships"
						title="Relationships"
					>
						<EntityLinks
							excludeTypeIds
							entity={entity}
							label="Relationship"
							relationshipTypeIds={[8, 9, 10, 1, 31, 62, 34, 35, 37]}
							urlPrefix={urlPrefix}
						/>
					</Tab>
					<Tab
						eventKey="entityRelatedCollections"
						title="Related Collections"
					>
						<EntityRelatedCollections collections={entity.collections} />
					</Tab>
					<Tab
						eventKey="review"
						title="Reviews"
					>
						<EntityReviews
							entityBBID={entity.bbid}
							entityReviews={entity.reviews}
							entityType={entity.type}
							handleModalToggle={handleModalToggle}
							ref={reviewsRef}
						/>
					</Tab>
				</Tabs>
			)}
			<hr className="margin-top-d40"/>
			<EntityFooter
				bbid={entity.bbid}
				deleted={entity.deleted}
				entityType={entity.type}
				entityUrl={urlPrefix}
				lastModified={entity.revision.revision.createdAt}
				user={user}
			/>
			{!entity.deleted && <CBReviewModal
				entityBBID={entity.bbid}
				entityName={entity.defaultAlias.name}
				entityType={entity.type}
				handleModalToggle={handleModalToggle}
				handleUpdateReviews={handleUpdateReviews}
				showModal={showCBReviewModal}
				userId={user?.id}
			                    />}
		</div>
	);
}
AuthorDisplayPage.displayName = 'AuthorDisplayPage';
AuthorDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired,
	wikipediaExtract: PropTypes.object
};
AuthorDisplayPage.defaultProps = {
	identifierTypes: [],
	wikipediaExtract: {}
};

export default AuthorDisplayPage;
