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
/* eslint valid-jsdoc: ["error", { "requireReturn": false }], max-len: "warn" */

'use strict';

/* eslint prefer-rest-params: 1, prefer-reflect: 1 */

const Area = require('bookbrainz-data').Area;
const Creator = require('bookbrainz-data').Creator;
const Edition = require('bookbrainz-data').Edition;
const Editor = require('bookbrainz-data').Editor;
const Publication = require('bookbrainz-data').Publication;
const Publisher = require('bookbrainz-data').Publisher;
const Work = require('bookbrainz-data').Work;
const Promise = require('bluebird');

/**
 * Returns an API path for interacting with the given Bookshelf entity model
 *
 * @param {object} entity - Entity object
 * @returns {string} - URL path to interact with entity
 */
function getEntityLink(entity) {
	const bbid = entity.bbid;
	return `/${entity.type.toLowerCase()}/${bbid}`;
}

/**
 * Returns all entity models defined in bookbrainz-data-js
 *
 * @returns {object} - Object mapping model name to the entity model
 */
function getEntityModels() {
	return {
		Creator,
		Edition,
		Publication,
		Publisher,
		Work
	};
}

/**
 * Retrieves the Bookshelf entity model with the given the model name
 *
 * @param {string} type - Name or type of model
 * @throws {Error} Throws a custom error if the param 'type' does not
 * map to a model
 * @returns {object} - Bookshelf model object with the type specified in the
 * single param
 */
function getEntityModelByType(type) {
	const entityModels = getEntityModels();

	if (!entityModels[type]) {
		throw new Error('Unrecognized entity type');
	}

	return entityModels[type];
}

/**
 * Regular expression for valid BookBrainz UUIDs (bbid)
 *
 * @type {RegExp}
 * @private
 */
const _bbidRegex =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Tests if a BookBrainz UUID is valid
 *
 * @param {string} bbid - BookBrainz UUID to validate
 * @returns {boolean} - Returns true if BookBrainz UUID is valid
 */
function isValidBBID(bbid) {
	return _bbidRegex.test(bbid);
}

/**
 * Helper-function / template-tag that allows the values of an object that
 * is passed in at a later time to be interpolated into a
 * string.
 *
 * Cribbed from MDN documentation on template literals:
 * https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals#Tagged_template_literals
 *
 * @param {string[]} strings - Array of string literals from template
 * @returns {function(*)} - Takes an object/array as an argument.
 * When invoked, it will return a string with all the key names from
 * the tagged template literal replaced with their corresponding values
 * from the newly passed in object.
 */
function template(strings) {
	const keys = Array.prototype.slice.call(arguments, 1);

	return (values) => {
		const result = [strings[0]];

		keys.forEach((key, i) => {
			result.push(values[key], strings[i + 1]);
		});

		return result.join('');
	};
}

/**
 * Generates a page title for an entity row
 *
 * @param {object} entity - Entity object
 * @param {string} titleForUnnamed - Fallback title in case entity has no name
 * @param {function} templateForNamed - Accepts an object with a name field and
 * uses it to generate a title string
 * @returns {string} - Title string
 */
function createEntityPageTitle(entity, titleForUnnamed, templateForNamed) {
	/**
	 * User-visible strings should _never_ be created by concatenation; when we
	 * start to implement localization, it will create problems for users of
	 * many languages. This helper is here to make it a little easier to do the
	 * right thing.
	 */
	let title = titleForUnnamed;

	// Accept template with a "name" replacement field
	if (entity && entity.defaultAlias && entity.defaultAlias.name) {
		title = templateForNamed({name: entity.defaultAlias.name});
	}

	return title;
}

/**
 * Adds 1 to the edit count of the specified editor
 *
 * @param {string} id - row ID of editor to be updated
 * @param {object} transacting - Bookshelf transaction object (must be in
 * progress)
 * @returns {Promise} - Resolves to the updated editor model
 */
function incrementEditorEditCountById(id, transacting) {
	return new Editor({id})
		.fetch({transacting})
		.then((editor) => {
			editor.incrementEditCount();
			return editor.save(null, {transacting});
		});
}

/**
 * Removes all rows from a selection of database tables
 *
 * @param {object} Bookshelf - Bookshelf instance connected to database
 * @param {string[]} tables - List of tables to truncate
 */
function truncateTables(Bookshelf, tables) {
	Promise.each(tables,
		(table) => Bookshelf.knex.raw(`TRUNCATE ${table} CASCADE`)
	);
}

module.exports = {
	createEntityPageTitle,
	getEntityLink,
	getEntityModelByType,
	getEntityModels,
	incrementEditorEditCountById,
	isValidBBID,
	template,
	truncateTables
};
