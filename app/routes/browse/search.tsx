import React from 'react';
import type {Route} from './+types/search';
import SearchPage from '../../../src/client/components/pages/search';
import {intParam} from '../../params';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Search Results \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	const {backend, user} = context.get(siteContext);
	const {searchParams} = new URL(request.url);
	// A repeated parameter (?q=a&q=b) is joined with commas, as Express did when it turned the array into a string
	const query = searchParams.getAll('q').join(',');
	const type = searchParams.has('type') ? searchParams.getAll('type').join(',') : null;
	const size = intParam(searchParams, 'size', 20);
	const from = intParam(searchParams, 'from', 0);
	const {entityTypes, initialResults, nextEnabled, total} = await backend.search.getPage({from, query, size, type: type ?? ''});
	return {entityTypes, from, initialResults, nextEnabled, query, resultsPerPage: size, total, type, user};
});

export default function Search({loaderData}: Route.ComponentProps) {
	const {type, user, ...props} = loaderData;
	// The page treats a missing type differently from an empty one
	return <SearchPage user={user} {...props} {...type === null ? {} : {type}}/>;
}
