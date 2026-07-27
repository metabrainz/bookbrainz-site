/*
 * Copyright (C) 2026 MetaBrainz Foundation
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

import {createHmac, timingSafeEqual} from 'crypto';
import express, {type Request, type Response} from 'express';

import config from '../../common/helpers/config';
import {getEventHandler} from '../helpers/oauthWebhooks';
import log from 'log';
import status from 'http-status';


const router = express.Router();
const SIGNATURE_PREFIX = 'sha256=';

type RequestWithRawBody = Request & {rawBody?: Buffer};

export function verifyWebhookSignature(secret: string, payloadBytes: Buffer, signatureHeader: string): boolean {
	if (!signatureHeader || !signatureHeader.startsWith(SIGNATURE_PREFIX)) {
		log.debug('Invalid signature header format');
		return false;
	}

	try {
		const expectedSignature = createHmac('sha256', secret)
			.update(payloadBytes)
			.digest('hex');
		const providedSignature = signatureHeader.slice(SIGNATURE_PREFIX.length);
		const expectedBuffer = Buffer.from(expectedSignature, 'hex');
		const providedBuffer = Buffer.from(providedSignature, 'hex');

		return expectedBuffer.length === providedBuffer.length &&
			timingSafeEqual(expectedBuffer, providedBuffer);
	}
	catch (err) {
		log.error('Error during signature verification:', err);
		return false;
	}
}

router.post('/metabrainz/', async (req: Request, res:Response) => {
	const eventType = req.get('X-MetaBrainz-Event');
	const deliveryId = req.get('X-MetaBrainz-Delivery');
	const attempt = req.get('X-MetaBrainz-Attempt');
	const signature = req.get('X-MetaBrainz-Signature-256');
	const userAgent = req.get('User-Agent');

	log.debug(
		`Webhook received: event=${eventType}, delivery=${deliveryId}, attempt=${attempt}, user_agent=${userAgent}`
	);

	if (!eventType || !deliveryId || !signature) {
		log.warning(`Missing required headers in webhook delivery ${deliveryId}`);
		return res.status(status.BAD_REQUEST).json({
			error: 'Missing required headers',
			required: [
				'X-MetaBrainz-Event',
				'X-MetaBrainz-Delivery',
				'X-MetaBrainz-Signature-256'
			]
		});
	}

	const {oAuthWebhookSecret} = config.musicbrainz;
	if (!oAuthWebhookSecret) {
		log.error('config.musicbrainz.oAuthWebhookSecret not configured');
		return res.status(status.SERVICE_UNAVAILABLE).json({
			error: 'Webhook receiver not properly configured'
		});
	}

	// See configuration of express.json() in src/server/app.js for this exception of attaching the raw body
	// to the request so we can do cryptographic verification of the signature
	const payloadBytes = (req as RequestWithRawBody).rawBody;
	if (!payloadBytes || !verifyWebhookSignature(oAuthWebhookSecret, payloadBytes, signature)) {
		log.warning(`Invalid signature for delivery ${deliveryId}.`);
		return res.status(status.UNAUTHORIZED).json({error: 'Invalid signature'});
	}

	const handler = getEventHandler(eventType);
	if (!handler) {
		log.error(`Unknown event type: ${eventType}`);
		return res.status(status.BAD_REQUEST).json({
			error: `Unknown event type: ${eventType}`
		});
	}

	try {
		await handler(req.app.locals.orm, req.body, deliveryId);
		log.debug(`Webhook processed successfully: event=${eventType}, delivery=${deliveryId}`);
		return res.status(status.OK).json({status: 'success'});
	}
	catch (err) {
		log.error(`Error processing webhook: event=${eventType}, delivery=${deliveryId}:`, err);
		return res.status(status.INTERNAL_SERVER_ERROR).json({
			error: 'Processing failed',
			message: 'An error occurred while processing the webhook.'
		});
	}
});

export default router;
