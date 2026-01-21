/*
 * Copyright (C) 2024  BookBrainz Contributors
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

import React, {useCallback, useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {faSlash} from '@fortawesome/free-solid-svg-icons';
import {getOpenLibraryCoverUrl} from '../../../../common/helpers/cover-image';


function EditionCover({backupIcon, deleted, editionName, identifiers}) {
	const [imageError, setImageError] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);

	const coverData = getOpenLibraryCoverUrl(identifiers);
	const coverUrl = coverData?.[0];
	const sourcePageUrl = coverData?.[1];

	const handleImageError = useCallback(() => {
		setImageError(true);
		setImageLoading(false);
	}, []);

	const handleImageLoad = useCallback(() => {
		setImageLoading(false);
	}, []);

	useEffect(() => {
		setImageError(false);
		setImageLoading(true);
	}, [coverUrl]);

	useEffect(() => {
		if (!coverUrl) {
			return null;
		}

		const img = new Image();
		img.onload = handleImageLoad;
		img.onerror = handleImageError;
		img.src = coverUrl;

		if (img.complete && img.naturalHeight !== 0) {
			setImageLoading(false);
		}

		return () => {
			img.onload = null;
			img.onerror = null;
		};
	}, [coverUrl, handleImageLoad, handleImageError]);

	if (deleted) {
		return (
			<div className="entity-display-icon fa-layers fa-fw">
				<FontAwesomeIcon
					icon={backupIcon}
					key="entityIcon"
					size="5x"
				/>
				<FontAwesomeIcon
					icon={faSlash}
					key="deletedIcon"
					size="5x"
				/>
			</div>
		);
	}

	if (coverUrl && !imageError) {
		return (
			<div className="edition-cover-container">
				<div className="edition-cover-wrapper">
					{imageLoading && (
						<div className="edition-cover-loading">
							<FontAwesomeIcon
								icon={backupIcon}
								size="5x"
							/>
						</div>
					)}
					<img
						alt={editionName ? `Cover of ${editionName}` : 'Book cover'}
						className={`edition-cover-image ${imageLoading ? 'loading' : ''}`}
						src={coverUrl}
						onError={handleImageError}
						onLoad={handleImageLoad}
					/>
				</div>
				{!imageLoading && (
					<small className="edition-cover-attribution text-muted">
					Cover from{' '}
						<a
							href={sourcePageUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
						OpenLibrary
						</a>
					</small>
				)}
			</div>
		);
	}

	return (
		<div className="entity-display-icon">
			<FontAwesomeIcon
				icon={backupIcon}
				size="5x"
			/>
		</div>
	);
}

EditionCover.displayName = 'EditionCover';
EditionCover.propTypes = {
	backupIcon: PropTypes.object.isRequired,
	deleted: PropTypes.bool,
	editionName: PropTypes.string,
	identifiers: PropTypes.array
};
EditionCover.defaultProps = {
	deleted: false,
	editionName: '',
	identifiers: []
};

export default EditionCover;
