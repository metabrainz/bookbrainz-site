import {requirePrivilege, requireUser} from '../../auth.server';
import AdminPanelSearchPage from '../../../src/client/components/pages/admin-panel-search';
import {PrivilegeType} from '../../../src/common/helpers/privileges-utils';
import React from 'react';
import type {Route} from './+types/admin-panel';
import {intParamOrDefault} from '../../params';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export function meta() {
	return [{title: 'Search Results \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	requirePrivilege(PrivilegeType.ADMIN, {context, request});
	const {backend, user} = context.get(siteContext);
	const {searchParams} = new URL(request.url);
	const query = searchParams.get('q') ?? '';
	const size = intParamOrDefault(searchParams, 'size', 20);
	const from = intParamOrDefault(searchParams, 'from', 0);
	const {initialResults, nextEnabled} = await backend.admin.searchEditors({from, query, size});
	return {from, initialResults, nextEnabled, query, resultsPerPage: size, user};
});

export default function AdminPanel({loaderData}: Route.ComponentProps) {
	return <AdminPanelSearchPage {...loaderData}/>;
}
