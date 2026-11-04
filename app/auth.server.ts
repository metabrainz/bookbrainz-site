import type {Route} from './+types/root';
import {redirect} from 'react-router';
import {siteContext} from './context';

// Authentication stays in Express; this guard controls access to pages.
export function requireUser({context, request}: Parameters<Route.MiddlewareFunction>[0]) {
	const {session, user} = context.get(siteContext);
	if (!user) {
		const {pathname, search} = new URL(request.url);
		if (session) {
			session.redirectTo = `${pathname}${search}`;
		}
		throw redirect('/auth', 303);
	}
}
