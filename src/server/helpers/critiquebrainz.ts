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

import request from 'superagent';


export async function getReviewsFromCB(bbid: string,
	entityType: string): Promise<any> {
	const mapEntityType = {
		EditionGroup: 'bb_edition_group'
	};
	const cbEntityType = mapEntityType[entityType];
	if (!entityType) {
		return {reviews: [], successfullyFetched: true};
	}
	try {
		const res = await request
			.get('https://critiquebrainz.org/ws/1/review')
			.query({
				// eslint-disable-next-line camelcase
				entity_id: bbid,
				// eslint-disable-next-line camelcase
				entity_type: cbEntityType,
				limit: 10,
				offset: 0
			});
		return {reviews: res.body, successfullyFetched: true};
	}
	catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		return {reviews: [], successfullyFetched: false};
	}
}
