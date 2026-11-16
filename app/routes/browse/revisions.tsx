import React from 'react';
import RevisionsPage from '../../../src/client/components/pages/revisions';
import type {Route} from './+types/revisions';
import {intParam} from '../../params';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Revisions \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	const {backend} = context.get(siteContext);
	const {searchParams} = new URL(request.url);
	const from = intParam(searchParams, 'from', 0);
	const size = intParam(searchParams, 'size', 20);
	const {nextEnabled, results} = await backend.revisions.getPage({from, size});
	// The revisions table shows the editor of each revision: an option of this screen, not data from the backend
	return {from, nextEnabled, results, showRevisionEditor: true, size};
});

export default function Revisions({loaderData}: Route.ComponentProps) {
	return <RevisionsPage {...loaderData}/>;
}
