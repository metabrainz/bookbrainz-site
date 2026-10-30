/*
 * Reads a number from the query string the way the Express handlers do (`value ? parseInt(value, 10) : fallback`),
 * so both give the same result for a missing, empty or malformed value.
 */
export function intParam(searchParams: URLSearchParams, name: string, fallback: number) {
	const value = searchParams.get(name);
	return value ? parseInt(value, 10) : fallback;
}
