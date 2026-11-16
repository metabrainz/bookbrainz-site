import {requirePrivilege, requireUser} from '../../auth.server';
import {PrivilegeType} from '../../../src/common/helpers/privileges-utils';
import React from 'react';
import type {Route} from './+types/search-admin';
import SearchAdminPage from '../../../src/client/components/pages/searchAdmin';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export const loader = siteErrors(({context, request}: Route.LoaderArgs) => {
	requirePrivilege(PrivilegeType.REINDEX_SEARCH_SERVER, {context, request});
	return null;
});

export function meta() {
	return [{title: 'Search Admin \u2013 BookBrainz'}];
}

export default function SearchAdmin() {
	return <SearchAdminPage/>;
}
