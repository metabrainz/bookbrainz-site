import {data} from 'react-router';
import {getErrorToSend} from '../src/common/helpers/error';

// Use the same error normalization as Express; preserve Router responses and redirects.
export function toRouteError(error: unknown) {
	if (error instanceof Response || (error as {type?: string})?.type === 'DataWithResponseInit') {
		return error;
	}
	const {detailedMessage, message, status} = getErrorToSend(error);
	return data({detailedMessage, message}, {status});
}


/**
 * Wraps a loader or action so the SiteErrors that the shared helpers throw (404, 400...) reach the root
 * ErrorBoundary with their status and message, as in the Express handlers.
 * @param {Function} handler - the loader or action
 * @returns {Function} the same function, with errors passed through toRouteError
 */
export function siteErrors<Args, Result>(handler: (args: Args) => Promise<Result> | Result) {
	return async (args: Args): Promise<Result> => {
		try {
			return await handler(args);
		}
		catch (error) {
			throw toRouteError(error);
		}
	};
}
