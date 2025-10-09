/*
 * Copyright (C) 2022       Ansh Goyal
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
import {faPlus, faRotate} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {Rating} from 'react-simple-star-rating';
import React from 'react';
import _ from 'lodash';
import request from 'superagent';


const {Button, Row} = bootstrap;


const REVIEW_CONTENT_PREVIEW_LENGTH = 75;

function ReviewCard(props) {
	if (!props?.reviewData || _.isEmpty(props.reviewData)) {
		return null;
	}
	const {reviewData} = props;
	const publishedDate = new Date(reviewData.published_on).toDateString();
	let reviewText = reviewData.text;
	if (reviewText?.length > REVIEW_CONTENT_PREVIEW_LENGTH) {
		reviewText = `${reviewText.substring(0, REVIEW_CONTENT_PREVIEW_LENGTH)}...`;
	}
	const reviewLink = `https://critiquebrainz.org/review/${reviewData.id}`;
	return (
		<div className="border bg-light p-2 mb-2" >
			<div>
				<Rating
					allowHalfIcon
					readonly
					allowHover={false}
					className="rating-stars"
					fillColor="#46433A"
					initialValue={reviewData.rating}
					ratingValue={0}
					size={15}
					stars={5}
				/>
				<small className="float-end">
					Review by: <b>{reviewData.user.display_name}</b> {publishedDate}
				</small>
			</div>
			{reviewText}
			<a className="float-end" href={reviewLink}>View &gt;</a>
		</div>
	);
}

class EntityReviews extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			reviews: props.entityReviews.reviews,
			successfullyFetched: props.entityReviews.successfullyFetched
		};
		this.entityType = props.entityType;
		this.entityBBID = props.entityBBID;
		this.handleModalToggle = props.handleModalToggle;
		this.reviewsCount = props.entityReviews?.reviews?.average_rating?.count || 0;
	}

	async handleClick() {
		const data = await request.get(`/${this.entityType}/${this.entityBBID}/reviews`);

		this.setState({
			reviews: data.body.reviews,
			successfullyFetched: data.body.successfullyFetched
		});
	}

	render() {
		let reviewContent;
		const mapEntityType = {
			Author: 'author',
			EditionGroup: 'edition-group',
			Series: 'series',
			Work: 'literary-work'
		};
		const cbEntityType = mapEntityType[this.entityType];
		const entityLink = `https://critiquebrainz.org/${cbEntityType}/${this.entityBBID}`;
		if (this.state.reviews.reviews?.length && !_.isEmpty(this.state.reviews)) {
			const {reviews: reviewsData} = this.state.reviews;
			reviewContent = (
				<React.Fragment>
					{
						reviewsData.slice(0, 3).map((review) => (
							<ReviewCard
								key={review.id}
								reviewData={review}
							/>
						))
					}
					<a href={entityLink}>View all reviews &gt;</a>
				</React.Fragment>
			);
		}
		else if (this.state.successfullyFetched) {
			reviewContent = (
				<div>
					<h4>No reviews yet.</h4>
					<Button
						className="margin-top-d15"
						variant="success"
						onClick={this.handleModalToggle}
					>
						<FontAwesomeIcon icon={faPlus}/>
						{'  Add a review'}
					</Button>
				</div>
			);
		}
		else {
			reviewContent = (
				<div>
					<h4>Could not fetch reviews.</h4>
					<Button
						variant="danger"
						onClick={this.handleClick}
					>
						<FontAwesomeIcon icon={faRotate}/>
						{'   Retry'}
					</Button>
				</div>
			);
		}
		return (
			<Row className="flex-column">
				<h2>
                    Reviews
					<span className="small text-muted">
					    {this.reviewsCount ?
						    ` ${this.reviewsCount} review${this.reviewsCount > 1 ? 's' : ''}` : ' No reviews'
						}
					</span>
				</h2>
				{reviewContent}
			</Row>
		);
	}
}


ReviewCard.displayName = 'ReviewCard';
ReviewCard.propTypes = {
	reviewData: PropTypes.shape({
		id: PropTypes.string.isRequired,
		// eslint-disable-next-line camelcase
		published_on: PropTypes.string.isRequired,
		rating: PropTypes.number,
		text: PropTypes.string,
		user: PropTypes.shape({
			// eslint-disable-next-line camelcase
			display_name: PropTypes.string.isRequired
		}).isRequired
	}).isRequired
};


EntityReviews.displayName = 'EntityReviews';
EntityReviews.propTypes = {
	entityBBID: PropTypes.string.isRequired,
	entityReviews: PropTypes.object.isRequired,
	entityType: PropTypes.string.isRequired,
	handleModalToggle: PropTypes.func.isRequired
};


export default EntityReviews;
