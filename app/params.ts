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

/**
 * The same for the pages whose handlers used `parseInt(value, 10) || fallback`, which also gives the fallback for 0.
 * @param {URLSearchParams} searchParams - the query string of the request
 * @param {string} name - the name of the parameter
 * @param {number} fallback - the number to use when the parameter is missing, empty or 0
 * @returns {number} the number in the parameter, or the fallback
 */
export function intParamOrDefault(searchParams: URLSearchParams, name: string, fallback: number) {
	return parseInt(searchParams.get(name) ?? '', 10) || fallback;
}
