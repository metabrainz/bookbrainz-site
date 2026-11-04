import {NotFoundError} from '../../../src/common/helpers/error';
import type {Route} from './+types/not-found';
import {siteErrors} from '../../errors.server';


// Renders the same "page not found" error page as the Express 404 handler
export const loader = siteErrors(({request}: Route.LoaderArgs) => {
	const {pathname, search} = new URL(request.url);
	throw new NotFoundError(null, {originalUrl: `${pathname}${search}`});
});

export default function NotFound() {
	return null;
}
