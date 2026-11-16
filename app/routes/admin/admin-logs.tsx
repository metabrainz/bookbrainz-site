import AdminLogsPage from '../../../src/client/components/pages/adminLogs';
import React from 'react';
import type {Route} from './+types/admin-logs';
import {intParamOrDefault} from '../../params';
import {requireUser} from '../../auth.server';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export function meta() {
	return [{title: 'Admin Logs \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	const {searchParams} = new URL(request.url);
	const size = intParamOrDefault(searchParams, 'size', 20);
	const from = intParamOrDefault(searchParams, 'from', 0);
	const {nextEnabled, results} = await context.get(siteContext).backend.admin.getLogsPage({from, size});
	return {from, nextEnabled, results, size};
});

export default function AdminLogs({loaderData}: Route.ComponentProps) {
	return <AdminLogsPage {...loaderData}/>;
}
