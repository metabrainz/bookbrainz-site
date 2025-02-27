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


import * as auth from '../helpers/auth';
import * as cbHelper from '../helpers/critiquebrainz';
import {ExternalServiceTokenT} from 'bookbrainz-data/lib/func/types';
import {PrivilegeType} from '../../common/helpers/privileges-utils';
import express from 'express';


const {ENTITY_EDITOR} = PrivilegeType;

const router = express.Router();

router.get('/:entityType/:bbid/reviews', async (req, res) => {
	const {entityType, bbid} = req.params;
	const reviews = await cbHelper.getReviewsFromCB(bbid, entityType);
	res.json(reviews);
});

router.post('/:entityType/:bbid/reviews', auth.isAuthenticatedForHandler, auth.isAuthorized(ENTITY_EDITOR), async (req, res) => {
	const editorId = req.user.id;
	const {orm} = req.app.locals;

	const {accessToken} = req.body;
	const {review} = req.body;

	let response = await cbHelper.submitReviewToCB(
		accessToken,
		review
	);

	let newAccessToken: ExternalServiceTokenT = {};
	// If the token has expired, we try to refresh it and then submit the review again.
	if (response?.error === 'invalid_token') {
		try {
			const token = await orm.func.externalServiceOauth.getOauthToken(
				editorId,
				'critiquebrainz',
				orm
			);

			newAccessToken = await cbHelper.refreshAccessToken(
				editorId,
				token.refresh_token,
				orm
			);
		}
		catch (error) {
			return res.json({error: error.message});
		}

		response = await cbHelper.submitReviewToCB(
			newAccessToken.access_token,
			review
		);
	}

	return res.json(response);
});

export default router;
