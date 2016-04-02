/*
 * Copyright (C) 2016  Ben Ockmore
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

'use strict';

const bookshelf = require('bookbrainz-data').bookshelf;
const _ = require('lodash');
const Editor = require('bookbrainz-data').Editor;
const Revision = require('bookbrainz-data').Revision;
const Note = require('bookbrainz-data').Note;
const status = require('http-status');
const Promise = require('bluebird');


module.exports.displayEntity = (req, res) => {
	const entity = res.locals.entity;
	let title = entity.type;

	if (entity.defaultAlias && entity.defaultAlias.name) {
		title += ` “${entity.defaultAlias.name}”`;
	}

	// Get unique identifier types for display
	const identifierTypes = entity.identifierSet &&
		_.uniq(
			_.map(entity.identifierSet.identifiers, 'type'),
			(type) => type.id
		);

	res.render(
		`entity/view/${entity.type.toLowerCase()}`,
		{title, identifierTypes}
	);
};

module.exports.displayDeleteEntity = (req, res) => {
	const entity = res.locals.entity;
	let title = entity.type;

	if (entity.defaultAlias && entity.defaultAlias.name) {
		title += ` “${entity.defaultAlias.name}”`;
	}

	res.render('entity/delete', {title});
};

module.exports.displayRevisions = (req, res, RevisionModel) => {
	const entity = res.locals.entity;
	let title = entity.type;

	if (entity.defaultAlias && entity.defaultAlias.name) {
		title += ` “${entity.defaultAlias.name}”`;
	}

	const bbid = req.params.bbid;
	return new RevisionModel()
		.where({bbid})
		.fetchAll({withRelated: ['revision', 'revision.author']})
		.then((collection) => {
			const revisions = collection.toJSON();
			return res.render('entity/revisions', {title, revisions});
		});
};

module.exports.handleDelete = (req, res, HeaderModel, RevisionModel) => {
	const entity = res.locals.entity;
	const editorJSON = req.session.passport.user;

	return bookshelf.transaction((transacting) => {
		const editorUpdatePromise = new Editor({id: editorJSON.id})
			.fetch({transacting})
			.then((editor) => {
				editor.set(
					'totalRevisions', editor.get('totalRevisions') + 1
				);
				editor.set(
					'revisionsApplied', editor.get('revisionsApplied') + 1
				);
				return editor.save(null, {transacting});
			});

		const newRevisionPromise = new Revision({
			authorId: editorJSON.id
		}).save(null, {transacting});

		const notePromise = req.body.note ? newRevisionPromise
			.then((revision) => new Note({
				authorId: editorJSON.id,
				revisionId: revision.get('id'),
				content: req.body.note
			}).save(null, {transacting})) : null;

		// No trigger for deletions, so manually create the <Entity>Revision
		// and update the entity header
		const newEntityRevisionPromise = newRevisionPromise
			.then((revision) => new RevisionModel({
				id: revision.get('id'),
				bbid: entity.bbid,
				dataId: null
			}).save(null, {method: 'insert', transacting}));

		const entityHeaderPromise = newEntityRevisionPromise
			.then((entityRevision) => new HeaderModel({
				bbid: entity.bbid,
				masterRevisionId: entityRevision.get('id')
			}).save(null, {transacting}));

		return Promise.join(
			editorUpdatePromise, newRevisionPromise, notePromise,
			newEntityRevisionPromise, entityHeaderPromise
		);
	})
		.then(() => {
			res.redirect(
				status.SEE_OTHER, `/${entity.type.toLowerCase()}/${entity.bbid}`
			);
		});
};
