/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
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

const Creator = require('bookbrainz-data').Creator;
const Edition = require('bookbrainz-data').Edition;
const Editor = require('bookbrainz-data').Editor;
const Publication = require('bookbrainz-data').Publication;
const Publisher = require('bookbrainz-data').Publisher;
const Work = require('bookbrainz-data').Work;

function getEntityLink(entity) {
	const bbid = entity.bbid;
	return `/${entity.type.toLowerCase()}/${bbid}`;
}

function getEntityModels() {
	return {
		Creator,
		Edition,
		Publication,
		Publisher,
		Work
	};
}

function getEntityModelByType(type) {
	const entityModels = getEntityModels();

	if (!entityModels[type]) {
		throw new Error('Unrecognized entity type');
	}

	return entityModels[type];
}

function incrementEditorEditCountById(id, transacting) {
	return new Editor({id})
		.fetch({transacting})
		.then((editor) => {
			editor.incrementEditCount();
			return editor.save(null, {transacting});
		});
}

module.exports = {
	getEntityLink,
	getEntityModels,
	getEntityModelByType,
	incrementEditorEditCountById
};
