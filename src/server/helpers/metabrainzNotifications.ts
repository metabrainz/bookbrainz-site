/* eslint-disable camelcase */
import {cacheJSON, getCachedJSON} from '../../common/helpers/cache';
import config from '../../common/helpers/config';

import log from 'log';
import request from 'superagent';


const METABRAINZ_NOTIFICATIONS_URL = 'http://metabrainz.org/notification';
const notificationScopes = ['notification'];
const TOKEN_CACHE_KEY = 'notification_access_token';

/**
 * Fetches a valid OAuth2 access token for the MetaBrainz notification API.
 * If a cached token exists in Redis, it’s used, else a new one is requested.
 * @returns {Promise<string|null>} OAuth2 access token or null if failed
 */
async function fetchToken(): Promise<string | null> {
	const cachedToken = await getCachedJSON<string>(TOKEN_CACHE_KEY);
	if (cachedToken) {
		return cachedToken;
	}

	const {clientID, clientSecret, oauthTokenURL} = config.musicbrainz;

	try {
		const response = await request
			.post(oauthTokenURL)
			.type('form')
			.send({
				client_id: clientID,
				client_secret: clientSecret,
				grant_type: 'client_credentials',
				scope: notificationScopes
			});

		const {access_token: accessToken, expires_in: expiresIn} = response.body;
		await cacheJSON(TOKEN_CACHE_KEY, accessToken, {expireTime: expiresIn});
		return accessToken;
	}
	catch (error: any) {
		log.error(error);
		return null;
	}
}

/**
 * Sends multiple notifications in one request.
 * @param {NotificationT[]} notifications - Array of notifications to send
 * @returns {Promise<void>} Resolves when the notifications has been sent.
 */
export async function sendMultipleNotifications(notifications: NotificationT[]): Promise<void> {
	const token = await fetchToken();
	const url = `${METABRAINZ_NOTIFICATIONS_URL}/send`;

	try {
		await request
			.post(url)
			.set('Authorization', `Bearer ${token}`)
			.set('Content-Type', 'application/json')
			.send(notifications);
	}
	catch (error: any) {
		log.error(error);
	}
}

/**
 * Sends a single notification.
 * Use either subject and body (for plain-text email)
 * or templateId and templateParams (for HTML email)
 * @param {number} musicbrainzRowId - Row ID for user in musicbrainz DB.
 * @param {string} userEmail - Recipient email.
 * @param {string} [subject] - Subject of plain-text email.
 * @param {string} [body] - Body of plain-text email.
 * @param {string} [templateId] - Template ID for HTML email.
 * @param {Record<string,string>} [templateParams] - Template parameters for HTML email.
 * @param {string} [fromAddr] - Sender address.
 * @param {string} [replyTo] - Reply-to address.
 * @param {string} [project] - Project name.
 * @param {boolean} [sendEmail] - Whether to send email.
 * @param {boolean} [important] - Whether the notification is important.
 * @param {number} [expireAge] - Expiration age in days.
 * @returns {Promise<void>} Resolves when the notifications has been sent.
 */
export async function sendNotification(
	musicbrainzRowId: number,
	userEmail: string,
	subject?: string,
	body?: string,
	templateId?: string,
	templateParams?: Record<string, string>,
	fromAddr = 'BookBrainz <noreply@bookbrainz.org>',
	replyTo = 'BookBrainz <noreply@bookbrainz.org>',
	project = 'bookbrainz',
	sendEmail = true,
	important = true,
	expireAge = 7
): Promise<void> {
	const notification: NotificationT = {
		body,
		expire_age: expireAge,
		important,
		project,
		reply_to: replyTo,
		send_email: sendEmail,
		sent_from: fromAddr,
		subject,
		template_id: templateId,
		template_params: templateParams,
		to: userEmail,
		user_id: musicbrainzRowId
	};

	await sendMultipleNotifications([notification]);
}

/**
 * NotificationT defines the structure of notification payload sent to metabrainz.org.
 */
export type NotificationT = {
  body?: string;
  expire_age: number;
  important: boolean;
  project: string;
  reply_to: string;
  send_email: boolean;
  sent_from: string;
  subject?: string;
  template_id?: string;
  template_params?: Record<string, string>;
  to: string;
  user_id: number;
};
