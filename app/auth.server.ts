import {type RouterContextProvider, redirect} from 'react-router';
import {NotAuthorizedError} from '../src/common/helpers/error';
import type {PrivilegeType} from '../src/common/helpers/privileges-utils';
import type {Route} from './+types/root';
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

// Checked at the start of a loader, not in middleware: an error from middleware reaches the error page without the site data.
export function requirePrivilege(privilege: PrivilegeType, {context, request}: {context: Readonly<RouterContextProvider>, request: Request}) {
	const {user} = context.get(siteContext);
	// eslint-disable-next-line no-bitwise
	if (!user || !(user.privs & privilege)) {
		const {pathname, search} = new URL(request.url);
		throw new NotAuthorizedError('You do not have the privilege to access this route', {originalUrl: `${pathname}${search}`});
	}
}
