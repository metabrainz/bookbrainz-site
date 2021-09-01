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
import React, {useEffect, useState} from 'react';
import EntityAnnotation from './annotation';
import EntityFooter from './footer';
import EntityImage from './image';
import EntityLinks from './links';
import EntityRelatedCollections from './related-collections';
import EntityTitle from './title';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {kebabCase as _kebabCase} from 'lodash';
import {faPlus} from '@fortawesome/free-solid-svg-icons';
import {labelsForAuthor} from '../../../helpers/utils';
import request from 'superagent';


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


function AuthorDisplayPage({entity, identifierTypes, user}) {
	const urlPrefix = getEntityUrl(entity);
	const [isSubscribed, setIsSubscribed] = useState(false);
	useEffect(() => {
		request.get(`/subscription/entity/isSubscribed/${entity.bbid}`).then(response => {
			if (response.body.isSubscribed) {
				setIsSubscribed(true);
			}
		});
	});
	function handleUnsubscribe(bbid) {
		const submissionUrl = '/subscription/unsubscribe/entity';
		request.post(submissionUrl)
			.send({bbid})
			.then((res) => {
				setIsSubscribed(false);
			}, (error) => {
				// eslint-disable-next-line no-console
				console.log('error thrown');
			});
	}
	function handleSubscribe(bbid) {
		const submissionUrl = '/subscription/subscribe/entity';
		request.post(submissionUrl)
			.send({bbid})
			.then((res) => {
				setIsSubscribed(true);
			}, (error) => {
				// eslint-disable-next-line no-console
				console.log('error thrown');
			});
	}

	/* eslint-disable react/jsx-no-bind */
	return (
		<div>
			<Row className="entity-display-background">
				<Col className="entity-display-image-box text-center" md={2}>
					<EntityImage
						backupIcon={ENTITY_TYPE_ICONS.Author}
						deleted={entity.deleted}
						imageUrl={entity.imageUrl}
					/>
				</Col>
				<Col md={10}>
					<EntityTitle entity={entity}/>
					<AuthorAttributes author={entity}/>
				</Col>
			</Row>
			{
				!isSubscribed &&
					<Button
						bsStyle="success"
						className="margin-top-d15"
						onClick={() => handleSubscribe(entity.bbid)}
					>
						Subscribe
					</Button>
			}
			{
				isSubscribed &&
					<Button
						bsStyle="danger"
						className="margin-top-d15"
						onClick={() => handleUnsubscribe(entity.bbid)}
					>
						Unsubscribe
					</Button>
			}
			<EntityAnnotation entity={entity}/>
			{!entity.deleted &&
			<React.Fragment>
				<EntityLinks
					entity={entity}
					identifierTypes={identifierTypes}
					urlPrefix={urlPrefix}
				/>
				<EntityRelatedCollections collections={entity.collections}/>
				<Button
					bsStyle="success"
					className="margin-top-d15"
					href={`/work/create?${_kebabCase(entity.type)}=${entity.bbid}`}
				>
					<FontAwesomeIcon className="margin-right-0-5" icon={faPlus}/>Add Work
				</Button>
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
AuthorDisplayPage.displayName = 'AuthorDisplayPage';
AuthorDisplayPage.propTypes = {
	entity: PropTypes.object.isRequired,
	identifierTypes: PropTypes.array,
	user: PropTypes.object.isRequired

};
AuthorDisplayPage.defaultProps = {
	identifierTypes: []
};

export default AuthorDisplayPage;
