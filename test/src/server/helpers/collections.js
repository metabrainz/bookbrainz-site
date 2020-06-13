/*
 * Copyright (C) 2020 Prabal Singh
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
import {
	createEditor,
	truncateEntities
} from '../../../test-helpers/create-entities';
import {date, random} from 'faker';
import {
	getOrderedCollectionsForEditorPage,
	getOrderedPublicCollections
} from '../../../../src/server/helpers/collections';

import chai from 'chai';
import orm from '../../../bookbrainz-data';


const {expect} = chai;
chai.use(require('chai-sorted'));

const {UserCollection, UserCollectionCollaborator} = orm;


describe('getOrderedPublicCollections', () => {
	before(async () => {
		const editor = await createEditor();
		const promiseArray = [];
		const collectionAttrib = {
			description: 'description',
			entityType: 'Author',
			name: 'name',
			ownerId: editor.get('id'),
			public: true
		};
		// create 5 public author collections
		for (let i = 1; i <= 5; i++) {
			collectionAttrib.lastModified = date.recent();
			collectionAttrib.createdAt = date.recent();
			promiseArray.push(
				new UserCollection(collectionAttrib).save(null, {method: 'insert'})
			);
		}
		// create 1 private author collection
		collectionAttrib.public = false;
		promiseArray.push(
			new UserCollection(collectionAttrib).save(null, {method: 'insert'})
		);
		// create 1 public Edition collection
		collectionAttrib.public = true;
		collectionAttrib.entityType = 'Edition';
		promiseArray.push(
			new UserCollection(collectionAttrib).save(null, {method: 'insert'})
		);
		await Promise.all(promiseArray);
	});
	after(truncateEntities);

	it('should return collections with expected keys', async () => {
		const orderedCollections = await getOrderedPublicCollections(0, 10, null, orm);
		orderedCollections.forEach((collection) => {
			expect(collection).to.have.keys(
				'id',
				'ownerId',
				'name',
				'description',
				'entityType',
				'public',
				'createdAt',
				'lastModified',
				'owner'
			);
		});
		expect(orderedCollections.length).to.equal(6);
		expect(orderedCollections).to.be.descendingBy('lastModified');
	});

	it('should return collections when a filter is applied', async () => {
		const orderedCollections = await getOrderedPublicCollections(0, 10, 'Author', orm);
		orderedCollections.forEach((collection) => {
			expect(collection).to.have.keys(
				'id',
				'ownerId',
				'name',
				'description',
				'entityType',
				'public',
				'createdAt',
				'lastModified',
				'owner'
			);
		});
		expect(orderedCollections.length).to.equal(5);
		expect(orderedCollections).to.be.descendingBy('lastModified');
	});

	it('should return collections when passed with an offset', async () => {
		const from = 2;
		const size = 2;
		const allCollections = await getOrderedPublicCollections(0, 10, null, orm);
		const orderedCollections = await getOrderedPublicCollections(from, size, null, orm);
		const allCollectionsSubset = allCollections.slice(from, from + size);
		expect(orderedCollections).to.deep.equal(allCollectionsSubset);
		expect(orderedCollections.length).to.equal(size);
		expect(orderedCollections).to.be.descendingBy('lastModified');
	});
});

describe('getOrderedCollectionsForEditorPage', () => {
	// eslint-disable-next-line one-var
	let editor, editor2;
	before(async () => {
		editor = await createEditor();
		editor2 = await createEditor();
		const collectionAttrib = {
			description: 'description',
			entityType: 'Author',
			name: 'name',
			ownerId: editor.get('id'),
			public: true
		};
		// create a public collections owned by editor1
		await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		// create a public collections owned by editor1 and editor2 as collaborator
		const collection = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		await new UserCollectionCollaborator({
			collaboratorId: editor2.get('id'),
			collectionId: collection.get('id')
		}).save(null, {method: 'insert'});
		// create a private collection owned by editor1
		collectionAttrib.public = false;
		await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		// create a private collection owned by editor1 and editor2 as collaborator
		const collection2 = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		await new UserCollectionCollaborator({
			collaboratorId: editor2.get('id'),
			collectionId: collection2.get('id')
		}).save(null, {method: 'insert'});
		// create one Edition collection with editor1 as owner
		collectionAttrib.public = true;
		collectionAttrib.entityType = 'Edition';
		await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
	});
	after(truncateEntities);

	it('should return all collections when editor1 is logged in (fetching collections for editor1)', async () => {
		const req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editor.get('id')
			},
			user: {
				id: editor.get('id')
			}
		};

		const orderedCollections = await getOrderedCollectionsForEditorPage(0, 10, null, req);

		expect(orderedCollections.length).to.equal(5);
		orderedCollections.forEach((collection) => {
			expect(collection).to.have.keys(
				'id',
				'ownerId',
				'name',
				'description',
				'entityType',
				'public',
				'createdAt',
				'lastModified',
				'isOwner'
			);
		});
	});

	it('should return only public collections when no one is logged in (fetching collections for editor1)', async () => {
		const req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editor.get('id')
			}
		};

		const orderedCollections = await getOrderedCollectionsForEditorPage(0, 10, null, req);

		expect(orderedCollections.length).to.equal(3);
		orderedCollections.forEach((collection) => {
			expect(collection).to.have.keys(
				'id',
				'ownerId',
				'name',
				'description',
				'entityType',
				'public',
				'createdAt',
				'lastModified',
				'isOwner'
			);
		});
	});

	it('should return all collections when editor2 is logged in (fetching collections for editor2)', async () => {
		const req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editor2.get('id')
			},
			user: {
				id: editor2.get('id')
			}
		};

		const orderedCollections = await getOrderedCollectionsForEditorPage(0, 10, null, req);

		expect(orderedCollections.length).to.equal(2);
		orderedCollections.forEach((collection) => {
			expect(collection).to.have.keys(
				'id',
				'ownerId',
				'name',
				'description',
				'entityType',
				'public',
				'createdAt',
				'lastModified',
				'isOwner'
			);
		});
	});

	it('should return only public collections when no one is logged in (fetching collections for editor2)', async () => {
		const req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editor2.get('id')
			}
		};

		const orderedCollections = await getOrderedCollectionsForEditorPage(0, 10, null, req);

		expect(orderedCollections.length).to.equal(1);
		expect(orderedCollections[0]).to.have.keys(
			'id',
			'ownerId',
			'name',
			'description',
			'entityType',
			'public',
			'createdAt',
			'lastModified',
			'isOwner'
		);
	});

	it('should return 1 collection when editor1 is logged in (fetching "Edition-Collection" for editor1)', async () => {
		const req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editor.get('id')
			},
			user: {
				id: editor.get('id')
			}
		};

		const orderedCollections = await getOrderedCollectionsForEditorPage(0, 10, 'Edition', req);

		expect(orderedCollections.length).to.equal(1);
		expect(orderedCollections[0]).to.have.keys(
			'id',
			'ownerId',
			'name',
			'description',
			'entityType',
			'public',
			'createdAt',
			'lastModified',
			'isOwner'
		);
	});

	it('should return correct collections when passed with an offset (fetching for editor1)', async () => {
		const from = 2;
		const size = 2;
		const req = {
			app: {
				locals: {
					orm
				}
			},
			params: {
				id: editor.get('id')
			},
			user: {
				id: editor.get('id')
			}
		};

		const allCollections = await getOrderedCollectionsForEditorPage(0, 10, null, req);
		const orderedCollections = await getOrderedCollectionsForEditorPage(from, size, null, req);
		const allCollectionsSubset = allCollections.slice(from, from + size);
		expect(orderedCollections).to.deep.equal(allCollectionsSubset);
		expect(orderedCollections.length).to.equal(size);
	});
});
