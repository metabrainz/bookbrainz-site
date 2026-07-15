/*
 * Copyright (C) 2026  MetaBrainz Foundation
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 */

import * as crypto from 'crypto';

import config from '../../common/helpers/config';
import request from 'superagent';


const REGISTRATION_REQUEST_EXPIRES_IN_MS = 5 * 60 * 1000;
const OAUTH_SCOPE = 'profile';

function getRegistrationOAuthURL(path:string) {
	return `${config.musicbrainz.oAuthBaseURL}${path}`;
}

function toBase64URL(buffer:Buffer) {
	return buffer.toString('base64')
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(new RegExp('=+$', 'u'), '');
}

function createRandomValue() {
	return toBase64URL(crypto.randomBytes(32));
}

function createCodeChallenge(codeVerifier:string) {
	return toBase64URL(crypto.createHash('sha256')
		.update(codeVerifier)
		.digest());
}

export function isPendingRegistrationRequestExpired(pendingRegistration) {
	if (!pendingRegistration?.createdAt) {
		return true;
	}
	return Date.now() - pendingRegistration.createdAt >
		REGISTRATION_REQUEST_EXPIRES_IN_MS;
}

export function clearPendingRegistrationRequest(req) {
	req.session.metabrainzRegistrationRequest = null;
}

export function isRegistrationRequestCallback(req) {
	const pendingRegistration = req.session.metabrainzRegistrationRequest;
	return Boolean(
		pendingRegistration?.state &&
		req.query?.state &&
		pendingRegistration.state === req.query.state
	);
}

export async function createRegistrationRequest(req, username:string, email:string) {
	const state = createRandomValue();
	const codeVerifier = createRandomValue();
	const codeChallenge = createCodeChallenge(codeVerifier);

	req.session.metabrainzRegistrationRequest = {
		codeVerifier,
		createdAt: Date.now(),
		state
	};

	const response = await request
		.post(getRegistrationOAuthURL('/registration-requests'))
		.type('form')
		.send({
			/* eslint-disable camelcase */
			client_id: config.musicbrainz.clientID,
			client_secret: config.musicbrainz.clientSecret,
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
			email,
			redirect_uri: config.musicbrainz.callbackURL,
			response_type: 'code',
			scope: OAUTH_SCOPE,
			state,
			username
			/* eslint-enable camelcase */
		});

	return response.body;
}

export async function exchangeRegistrationRequestCode(req) {
	const pendingRegistration = req.session.metabrainzRegistrationRequest;
	const tokenResponse = await request
		.post(getRegistrationOAuthURL('/token'))
		.type('form')
		.send({
			/* eslint-disable camelcase */
			client_id: config.musicbrainz.clientID,
			client_secret: config.musicbrainz.clientSecret,
			code: req.query.code,
			code_verifier: pendingRegistration.codeVerifier,
			grant_type: 'authorization_code',
			redirect_uri: config.musicbrainz.callbackURL
			/* eslint-enable camelcase */
		});

	return tokenResponse.body;
}

export async function fetchUserInfo(accessToken:string) {
	const response = await request
		.get(getRegistrationOAuthURL('/userinfo'))
		.set('Authorization', `Bearer ${accessToken}`);

	return response.body;
}

export function getRegistrationRequestErrorMessage(err) {
	const body = err?.response?.body || err?.body || {};
	if (body.error_description) {
		return body.error_description;
	}

	if (body.error === 'unauthorized_client') {
		return 'Registration requests are not enabled for this OAuth client.';
	}

	if (body.error === 'invalid_request') {
		return 'The registration request contains invalid data.';
	}

	if (body.error === 'invalid_client' || body.error === 'invalid_scope') {
		return 'BookBrainz could not start MetaBrainz registration because OAuth is not configured correctly.';
	}

	return 'BookBrainz could not start MetaBrainz registration. Please try again.';
}

export function getRegistrationRequestExpiresInMs() {
	return REGISTRATION_REQUEST_EXPIRES_IN_MS;
}
