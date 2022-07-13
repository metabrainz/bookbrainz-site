import * as bootstrap from 'react-bootstrap';
import React from 'react';
import {Rating} from 'react-simple-star-rating';
import {getEntityLink} from '../../../../common/helpers/utils';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';


const {Button, Col, Row} = bootstrap;


const REVIEW_CONTENT_PREVIEW_LENGTH = 75;

function ReviewCard({reviewData}) {
	const publishedDate = new Date(reviewData.published_on).toDateString();
	let reviewText = reviewData.text;
	if (reviewText.length > REVIEW_CONTENT_PREVIEW_LENGTH) {
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
				<small className="float-right">
                    Review by: <b>{reviewData.user.display_name}</b> {publishedDate}
				</small>
			</div>
			<div>
				{reviewText}
				<a className="float-right" href={reviewLink}>View &gt;</a>
			</div>
		</div>
	);
}

function EntityReviews({entityReviews, entityType, entityBBID}) {
	let reviewContent;
	const mapEntityType = {
		EditionGroup: 'edition-group'
	};
	entityType = mapEntityType[entityType];
	const entityLink = `https://critiquebrainz.org/${entityType}/${entityBBID}`;
	if (entityReviews?.length) {
		const {reviews} = entityReviews;
		reviewContent = (
			<React.Fragment>
				{
					reviews.slice(0, 3).map((review) => (
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
	else {
		reviewContent = (
			<div>
				<h4>No reviews yet.</h4>
				<Button
					className="margin-top-d15"
					href={entityLink}
					variant="success"
				>
					<FontAwesomeIcon icon={faPlus}/>
					{'  Add a review'}
				</Button>
			</div>
		);
	}
	return (
		<div>
			<h2>Reviews</h2>
			{reviewContent}
		</div>
	);
}

export default EntityReviews;
