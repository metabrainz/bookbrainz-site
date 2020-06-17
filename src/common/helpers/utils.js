
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
 * This function maps `{a: somePromise}` to a promise that
 * resolves with `{a: resolvedValue}`.
 * @param {object} obj - an object with Promises as values
 * @returns {Promise<object>} - A Promise resolving to the object with resolved values
 */
export function makePromiseFromObject(obj: Object): Promise<Object> {
	const keys = Object.keys(obj);
	const values = Object.values(obj);
	return Promise.all(values)
	  .then(resolved => {
			const res = {};
			for (let i = 0; i < keys.length; i += 1) {
		  res[keys[i]] = resolved[i];
			}
			return res;
	  });
}
