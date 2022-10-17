import PropTypes from 'prop-types';
import {Rating} from 'react-simple-star-rating';
import React from 'react';


function AverageRating({averageRatings, reviewsCount}) {
	return (
		<>
			<dt>Ratings</dt>
			<dd>
				<Rating
					allowFraction
					readonly
					allowHover={false}
					className="rating-stars"
					fillColor="#46433A"
					iconsCount={5}
					initialValue={averageRatings}
					size={20}
				/>
			</dd>
			<dd className="mt-n2 small text-muted">
				{reviewsCount ?
					`${reviewsCount} review${reviewsCount > 1 ? 's' : ''}` : 'No reviews'
				}
			</dd>
		</>
	);
}

AverageRating.displayName = 'AverageRating';
AverageRating.propTypes = {
	averageRatings: PropTypes.number.isRequired,
	reviewsCount: PropTypes.number.isRequired
};

export default AverageRating;
