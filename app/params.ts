/**
 * Reads a number from the query string the way the Express handlers did (`value ? parseInt(value, 10) : fallback`),
 * so a missing, empty or malformed value gives the same result.
 * @param {URLSearchParams} searchParams - the query string of the request
 * @param {string} name - the name of the parameter
 * @param {number} fallback - the number to use when the parameter is missing or empty
 * @returns {number} the number in the parameter, or the fallback
 */
export function intParam(searchParams: URLSearchParams, name: string, fallback: number) {
	const value = searchParams.get(name);
	return value ? parseInt(value, 10) : fallback;
}
