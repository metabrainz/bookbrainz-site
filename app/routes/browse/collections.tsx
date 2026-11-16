import CollectionsPage from '../../../src/client/components/pages/collections';
import React from 'react';
import type {Route} from './+types/collections';
import {intParam} from '../../params';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'All Collections \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	const {backend, user} = context.get(siteContext);
	const {searchParams} = new URL(request.url);
	const from = intParam(searchParams, 'from', 0);
	const size = intParam(searchParams, 'size', 20);
	const type = searchParams.get('type') || null;
	const {entityTypes, nextEnabled, results} = await backend.collections.getPublicPage({from, size, type});
	return {
		entityTypes, from, nextEnabled, results, showLastModified: true, showOwner: true, size,
		tableHeading: 'Public Collections', type, user
	};
});

export default function Collections({loaderData}: Route.ComponentProps) {
	const {user, ...props} = loaderData;
	return <CollectionsPage {...props} {...user ? {user} : {}}/>;
}
