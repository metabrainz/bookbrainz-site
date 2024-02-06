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
import {
	getOrderedCollectionsForEditorPage,
	getOrderedPublicCollections
} from '../../../../src/server/helpers/collections';
import assertArrays from 'chai-arrays';
import chai from 'chai';
import {faker} from '@faker-js/faker';
import isSorted from 'chai-sorted';
import orm from '../../../bookbrainz-data';


const {expect} = chai;
chai.use(isSorted);
chai.use(assertArrays);

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
			collectionAttrib.lastModified = faker.date.recent();
			collectionAttrib.createdAt = faker.date.recent();
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
				'owner',
				'itemCount'
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
				'owner',
				'itemCount'
			);
			expect(collection.entityType).to.equal('Author');
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
	// eslint-disable-next-line one-var
	let collectionID, collectionID2, collectionID3, collectionID4, collectionID5;
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
		const collection = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		collectionID = collection.get('id');

		// create a public collections owned by editor1 and editor2 as collaborator
		const collection2 = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		collectionID2 = collection2.get('id');
		await new UserCollectionCollaborator({
			collaboratorId: editor2.get('id'),
			collectionId: collectionID2
		}).save(null, {method: 'insert'});

		// create a private collection owned by editor1
		collectionAttrib.public = false;
		const collection3 = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		collectionID3 = collection3.get('id');

		// create a private collection owned by editor1 and editor2 as collaborator
		const collection4 = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		collectionID4 = collection4.get('id');
		await new UserCollectionCollaborator({
			collaboratorId: editor2.get('id'),
			collectionId: collectionID4
		}).save(null, {method: 'insert'});

		// create one Edition collection with editor1 as owner
		collectionAttrib.public = true;
		collectionAttrib.entityType = 'Edition';
		const collection5 = await new UserCollection(collectionAttrib).save(null, {method: 'insert'});
		collectionID5 = collection5.get('id');
	});
	after(truncateEntities);

	it('should return collections with expected keys', async () => {
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
				'isOwner',
				'itemCount'
			);
		});
	});

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

		const collectionIDs = orderedCollections.map(collection => collection.id);

		expect(orderedCollections.length).to.equal(5);
		expect(collectionIDs).to.be.containingAllOf([collectionID, collectionID2, collectionID3, collectionID4, collectionID5]);
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

		const collectionIDs = orderedCollections.map(collection => collection.id);

		// collection 1, 2, and 5 are public collections
		expect(orderedCollections.length).to.equal(3);
		expect(collectionIDs).to.be.containingAllOf([collectionID, collectionID2, collectionID5]);
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
		const collectionIDs = orderedCollections.map(collection => collection.id);

		// editor2 is collaborator for collection 2 and 4
		expect(orderedCollections.length).to.equal(2);
		expect(collectionIDs).to.be.containingAllOf([collectionID2, collectionID4]);
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

		// collection2 is public and editor2 is it's collaborator
		expect(orderedCollections.length).to.equal(1);
		expect(orderedCollections[0].id).to.equal(collectionID2);
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
		expect(orderedCollections[0].entityType).to.equal('Edition');
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
