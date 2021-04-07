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

/* eslint-disable sort-imports */
import PropTypes from 'prop-types';
import {Col, Row} from 'react-bootstrap';
import React, {useEffect, useState} from 'react';


function EntityRelatedCollections({bbid}) {
	const [collections, setCollections] = useState([]);

	async function getCollectionId(entityId) {
		const collectionId = await fetch(`/collection/entity/${entityId}`, {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		});

		const allRelatedCollection = await collectionId.json();
		const storeCollections = [];

		if (allRelatedCollection.length) {
			allRelatedCollection.map(async (collectionItem, index) => {
				// Fetch collection data
				const collection = await fetch(`/collection/get/${collectionItem.collection_id}`, {
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					}
				});

				const collectionData = await collection.json();
				// Filter collections
				if (collectionData.public) {
					storeCollections.push(collectionData);
				}
				// update state when all collections are filtered
				if (index === (allRelatedCollection.length - 1)) {
					setCollections(storeCollections);
				}
			});
		}
	}

	useEffect(() => {
		getCollectionId(bbid);
	}, []);

	return (
		<Row>
			<Col md={12}>
			    <h2>Related Collections</h2>
				<ul className="list-unstyled">
					{collections.length ?
						collections.map((collection) => (
							<li
								key={collection.id}
							>
								<a href={`/collection/${collection.id}`}>{collection.name}</a>
							</li>
						)) : <h4>None</h4>}
				</ul>

			</Col>
		</Row>
	);
}
EntityRelatedCollections.displayName = 'EntityRelatedCollections';
EntityRelatedCollections.propTypes = {
	bbid: PropTypes.string.isRequired
};

export default EntityRelatedCollections;
