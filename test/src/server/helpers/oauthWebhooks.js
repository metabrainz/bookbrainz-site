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
/* eslint-disable camelcase */

import * as search from '../../../../src/common/helpers/search';
import {
	getEventHandler,
	handleUserCreated,
	handleUserDeleted,
	handleUserUpdated
} from '../../../../src/server/helpers/oauthWebhooks';

import chai from 'chai';
import orm from '../../../bookbrainz-data';
import {stub} from 'sinon';
import {truncateEntities} from '../../../test-helpers/create-entities';


const {expect} = chai;
const {Editor, EditorType} = orm;

const deliveryId = 'test-delivery-id';

function createDefaultEditorType() {
	return new EditorType({label: 'Editor'})
		.save(null, {method: 'insert'});
}

function fetchEditorByMetaBrainzUserId(metabrainzUserId) {
	return new Editor({metabrainzUserId})
		.fetch({require: false});
}

async function createEditorFromWebhook(metabrainzUserId, name) {
	await createDefaultEditorType();
	await handleUserCreated(orm, {
		name,
		user_id: metabrainzUserId
	}, deliveryId);
	return fetchEditorByMetaBrainzUserId(metabrainzUserId);
}

describe('OAuth webhook event handlers', () => {
	let indexEntityStub;

	beforeEach(() => {
		indexEntityStub = stub(search, 'indexEntity').resolves();
	});

	afterEach(async () => {
		indexEntityStub.restore();
		await truncateEntities();
	});

	describe('getEventHandler', () => {
		it('should return the matching handler for supported event types', () => {
			expect(getEventHandler('user.created')).to.equal(handleUserCreated);
			expect(getEventHandler('user.updated')).to.equal(handleUserUpdated);
			expect(getEventHandler('user.deleted')).to.equal(handleUserDeleted);
		});

		it('should return undefined for unknown event types', () => {
			expect(getEventHandler('unknown.event')).to.be.undefined;
		});
	});

	describe('handleUserCreated', () => {
		it('should create an editor linked to the MetaBrainz user ID', async () => {
			await createDefaultEditorType();

			await handleUserCreated(orm, {
				name: 'newuser',
				user_id: 123
			}, deliveryId);

			const editor = await fetchEditorByMetaBrainzUserId(123);
			const editorJSON = editor.toJSON();

			expect(editorJSON.cachedMetabrainzName).to.equal('newuser');
			expect(editorJSON.metabrainzUserId).to.equal(123);
			expect(editorJSON.name).to.equal('newuser');
			expect(indexEntityStub.calledOnce).to.equal(true);
		});
	});

	describe('handleUserUpdated', () => {
		it('should update the cached MetaBrainz username', async () => {
			await createEditorFromWebhook(456, 'oldusername');

			await handleUserUpdated(orm, {
				new: {username: 'newusername'},
				old: {username: 'oldusername'},
				user_id: 456
			}, deliveryId);

			const editor = await fetchEditorByMetaBrainzUserId(456);

			expect(editor.get('cachedMetabrainzName')).to.equal('newusername');
		});

		it('should ignore email-only updates because BookBrainz does not store MetaBrainz email addresses', async () => {
			await createEditorFromWebhook(456, 'newusername');

			await handleUserUpdated(orm, {
				new: {email: 'new@example.com'},
				old: {},
				user_id: 456
			}, deliveryId);

			const editor = await fetchEditorByMetaBrainzUserId(456);

			expect(editor.get('cachedMetabrainzName')).to.equal('newusername');
		});

		it('should update the username and ignore email when both changed', async () => {
			await createEditorFromWebhook(456, 'newusername');

			await handleUserUpdated(orm, {
				new: {
					email: 'user-456@example.com',
					username: 'user-456'
				},
				old: {
					email: 'new@example.com',
					username: 'newusername'
				},
				user_id: 456
			}, deliveryId);

			const editor = await fetchEditorByMetaBrainzUserId(456);

			expect(editor.get('cachedMetabrainzName')).to.equal('user-456');
		});

		it('should not create an editor when the MetaBrainz user ID is not found', async () => {
			await handleUserUpdated(orm, {
				new: {username: 'newname'},
				old: {username: 'nonexistent'},
				user_id: 99999
			}, deliveryId);

			const editor = await fetchEditorByMetaBrainzUserId(99999);

			expect(editor).to.be.null;
		});
	});

	describe('handleUserDeleted', () => {
		it('should do nothing when the MetaBrainz user ID is not found', async () => {
			await handleUserDeleted(orm, {
				user_id: 99999
			}, deliveryId);

			const editor = await fetchEditorByMetaBrainzUserId(99999);

			expect(editor).to.be.null;
		});

		it('should clear the editor for the matching MetaBrainz user ID', async () => {
			const editor = await createEditorFromWebhook(789, 'deleteuser');

			await handleUserDeleted(orm, {
				user_id: 789
			}, deliveryId);

			// const deletedEditor = await new Editor({id: editor.id})
			// 	.fetch({require: true});
			const deletedEditor = await fetchEditorByMetaBrainzUserId(789);


			expect(deletedEditor.get('cachedMetabrainzName')).to.equal('<deleted>');
			expect(deletedEditor.get('name')).to.equal(`Deleted Editor #${editor.id}`);
		});
	});
});
