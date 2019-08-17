
// @flow

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
export function isValidBBID(bbid: string): boolean {
	return _bbidRegex.test(bbid);
}


/**
 * Returns all entity models defined in bookbrainz-data-js
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @returns {object} - Object mapping model name to the entity model
 */
export function getEntityModels(orm: Object): Object {
	const {Author, Edition, EditionGroup, Publisher, Work} = orm;
	return {
		Author,
		Edition,
		EditionGroup,
		Publisher,
		Work
	};
}

/**
 * Retrieves the Bookshelf entity model with the given the model name
 *
 * @param {object} orm - the BookBrainz ORM, initialized during app setup
 * @param {string} type - Name or type of model
 * @throws {Error} Throws a custom error if the param 'type' does not
 * map to a model
 * @returns {object} - Bookshelf model object with the type specified in the
 * single param
 */
export function getEntityModelByType(orm: Object, type: string): Object {
	const entityModels = getEntityModels(orm);

	if (!entityModels[type]) {
		throw new Error(`Unrecognized entity type: '${type}'`);
	}

	return entityModels[type];
}
