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

/* eslint-disable camelcase */

import config from '../../common/helpers/config';
import log from 'log';
import request from 'superagent';


const OAUTH_AUTHORIZE_URL = 'https://critiquebrainz.org/oauth/authorize';
const OAUTH_TOKEN_URL = 'https://critiquebrainz.org/ws/1/oauth/token';
const REVIEW_URL = 'https://critiquebrainz.org/ws/1/review/';
const critiquebrainzScopes = ['review'];
const cbConfig = config.critiquebrainz;

const mapEntityType = {
	Author: 'bb_author',
	EditionGroup: 'bb_edition_group',
	Series: 'bb_series',
	Work: 'bb_literary_work'
};

export async function addNewUser(
	editorId: number,
	token: Record<string, any>,
	orm: Record<string, any>
): Promise<any> {
	const expires = Math.floor(new Date().getTime() / 1000.0) + token.tokenExpires;

	try {
		const newUser = await orm.func.externalServiceOauth.saveOauthToken(
			editorId,
			'critiquebrainz',
			token.accessToken,
			token.refreshToken,
			expires,
			critiquebrainzScopes,
			orm
		);
		return newUser;
	}
	catch (error) {
		log.error(error);
		return null;
	}
}


export function getAuthURL(): string {
	const authURL = new URL(OAUTH_AUTHORIZE_URL);
	authURL.searchParams.set('client_id', cbConfig.clientID);
	authURL.searchParams.set('redirect_uri', cbConfig.callbackURL);
	authURL.searchParams.set('response_type', 'code');
	authURL.searchParams.set('scope', critiquebrainzScopes.join(','));
	return authURL.href;
}


export async function fetchAccessToken(
	code: string,
	editorId: number,
	orm: Record<string, any>
) : Promise<any> {
	try {
		const data = await request.post(OAUTH_TOKEN_URL)
			.type('form')
			.send({
				client_id: cbConfig.clientID,
				client_secret: cbConfig.clientSecret,
				code,
				grant_type: 'authorization_code',
				redirect_uri: cbConfig.callbackURL
			});

		const token = await data.body;
		const expires = Math.floor(new Date().getTime() / 1000.0) + token.expires_in;
		const newUser = await orm.func.externalServiceOauth.saveOauthToken(
			editorId,
			'critiquebrainz',
			token.access_token,
			token.refresh_token,
			expires,
			critiquebrainzScopes,
			orm
		);
		return newUser;
	}
	catch (error) {
		log.error(error.response?.error);
		return null;
	}
}


export async function refreshAccessToken(
	editorId: number,
	refreshToken: string,
	orm: Record<string, any>
): Promise<any> {
	try {
		const data = await request.post(OAUTH_TOKEN_URL)
			.type('form')
			.send({
				client_id: cbConfig.clientID,
				client_secret: cbConfig.clientSecret,
				grant_type: 'refresh_token',
				redirect_uri: cbConfig.callbackURL,
				refresh_token: refreshToken
			});
		const token = await data.body;
		const expires = Math.floor(new Date().getTime() / 1000.0) + token.expires_in;
		const updatedToken = await orm.func.externalServiceOauth.updateOauthToken(
			editorId,
			'critiquebrainz',
			token.access_token,
			token.refresh_token,
			expires,
			orm
		);
		return updatedToken;
	}
	catch (error) {
		log.error(error.response?.error);
		return null;
	}
}


export async function getReviewsFromCB(bbid: string,
	entityType: string): Promise<any> {
	const cbEntityType = mapEntityType[entityType];
	if (!cbEntityType) {
		return {reviews: [], successfullyFetched: true};
	}
	try {
		const res = await request
			.get(REVIEW_URL)
			.query({
				entity_id: bbid,
				entity_type: cbEntityType,
				limit: 3,
				offset: 0
			});
		return {reviews: res.body, successfullyFetched: true};
	}
	catch (err) {
		log.error(err.response?.error);
		return {reviews: [], successfullyFetched: false};
	}
}

export async function submitReviewToCB(
	accessToken: string,
	review: Record<string, any>
): Promise<any> {
	const cbEntityType = mapEntityType[review.entityType];

	if (!cbEntityType) {
		return {
			message: 'Entity type not supported',
			reviewID: null,
			successfullySubmitted: false
		};
	}

	try {
		const res = await request
			.post(REVIEW_URL)
			.set('Content-Type', 'application/json')
			.auth(accessToken, {type: 'bearer'})
			.send({
				entity_id: review.entityBBID,
				entity_type: cbEntityType,
				language: review.language,
				license_choice: 'CC BY-SA 3.0',
				rating: review.rating,
				text: review.textContent
			});
		return {
			error: null,
			message: res.body.message,
			reviewID: res.body.id,
			successfullySubmitted: true
		};
	}

	catch (error) {
		return {
			error: error.response?.body?.error,
			message: error.response?.body?.description,
			reviewID: null,
			successfullySubmitted: false
		};
	}
}
