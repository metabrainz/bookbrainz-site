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

import * as search from '../../common/helpers/search';
import {deleteEditorByMetaBrainzID, fetchEditorByMetaBrainzUserId} from './editor';

import type {ORM} from 'bookbrainz-data';
import log from 'log';

/* eslint-disable camelcase */
type UserCreatedPayload = {
	name: string,
	user_id: number
};

type UserUpdatedPayload = {
	new?: {
		email?: string,
		name?: string
	},
	old?: {
		email?: string,
		name?: string
	},
	user_id: number
};

type UserDeletedPayload = {
	user_id: number
};
/* eslint-enable camelcase */

export type OAuthWebhookPayload =
	UserCreatedPayload | UserUpdatedPayload | UserDeletedPayload;

export type OAuthWebhookEventHandler = (
	orm: ORM,
	payload: OAuthWebhookPayload,
	deliveryId: string
) => Promise<void>;


export async function handleUserCreated(
	orm: ORM,
	payload: UserCreatedPayload,
	deliveryId: string
): Promise<void> {
	const existingEditor = await fetchEditorByMetaBrainzUserId(orm, payload.user_id);

	if (existingEditor) {
		log.debug(
			`Ignoring duplicate user.created OAuth webhook delivery ${deliveryId} for metabrainz_user_id=${payload.user_id}`
		);
		return;
	}

	const {Editor, EditorType} = orm;
	const editorType = await new EditorType({label: 'Editor'})
		.fetch({require: true});

	const editor = await new Editor({
		cachedMetabrainzName: payload.name,
		metabrainzUserId: payload.user_id,
		name: payload.name,
		typeId: editorType.id
	}).save();

	editor.set('type', 'Editor');
	await search.indexEntity(editor);
}

export async function handleUserUpdated(
	orm: ORM,
	payload: UserUpdatedPayload,
	deliveryId: string
): Promise<void> {
	const newUsername = payload.new?.name;
	if (!newUsername) {
		log.debug(
			`No username update in user.updated OAuth webhook delivery ${deliveryId} for metabrainz_user_id=${payload.user_id}`
		);
		return;
	}

	// const newEmail = payload.new?.email;
	// if (newEmail) {
	// BookBrainz does not store email addresses at the moment,
	// but if you need to keep them up to date it would be here
	// }

	const editor = await fetchEditorByMetaBrainzUserId(orm, payload.user_id);

	if (!editor) {
		log.warning(
			`Editor with metabrainz_user_id=${payload.user_id} not found for user.updated OAuth webhook delivery ${deliveryId}`
		);
		return;
	}

	await editor.save({cachedMetabrainzName: newUsername, name: newUsername}, {patch: true});
}

export async function handleUserDeleted(
	orm: ORM,
	payload: UserDeletedPayload,
	deliveryId: string
): Promise<void> {
	const editor = await fetchEditorByMetaBrainzUserId(orm, payload.user_id);

	if (!editor) {
		log.warning(
			`Editor with metabrainz_user_id=${payload.user_id} not found for user.deleted OAuth webhook delivery ${deliveryId}`
		);
		return;
	}

	const deleted = await deleteEditorByMetaBrainzID(orm, payload.user_id);

	if (!deleted) {
		log.warning(
			`Editor with metabrainz_user_id=${payload.user_id} was not deleted for user.deleted OAuth webhook delivery ${deliveryId}`
		);
	}
}

export const EVENT_HANDLERS = {
	'user.created': handleUserCreated as OAuthWebhookEventHandler,
	'user.deleted': handleUserDeleted as OAuthWebhookEventHandler,
	'user.updated': handleUserUpdated as OAuthWebhookEventHandler
};

export type OAuthWebhookEventType = keyof typeof EVENT_HANDLERS;

export function getEventHandler(eventType: string): OAuthWebhookEventHandler | undefined {
	return EVENT_HANDLERS[eventType as OAuthWebhookEventType];
}
