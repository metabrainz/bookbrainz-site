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

import {createEditor, truncateEntities} from '../../../test-helpers/create-entities';

import chai from 'chai';
import {deserializeEditor} from '../../../../src/server/helpers/auth';
import orm from '../../../bookbrainz-data';


const {expect} = chai;

describe('auth helpers', () => {
	afterEach(truncateEntities);

	describe('deserializeEditor', () => {
		it('should fetch an active editor from a serialized editor ID', async () => {
			const editor = await createEditor(123456);

			const deserializedEditor = await deserializeEditor(orm, editor.id);

			expect(deserializedEditor.id).to.equal(editor.id);
			expect(deserializedEditor.name).to.equal(editor.get('name'));
		});

		it('should support legacy sessions serialized with full editor JSON', async () => {
			const editor = await createEditor(123456);

			const deserializedEditor = await deserializeEditor(orm, editor.toJSON());

			expect(deserializedEditor.id).to.equal(editor.id);
		});

		it('should reject missing editors', async () => {
			const deserializedEditor = await deserializeEditor(orm, 999999);

			expect(deserializedEditor).to.equal(false);
		});

		it('should reject deleted editors', async () => {
			const editor = await createEditor(123456);
			await editor.save({
				cachedMetabrainzName: '<deleted>',
				name: `Deleted Editor #${editor.id}`
			}, {patch: true});

			const deserializedEditor = await deserializeEditor(orm, editor.id);

			expect(deserializedEditor).to.equal(false);
		});
	});
});
