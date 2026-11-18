import ExternalServices from '../../src/client/components/pages/externalService';
import React from 'react';
import type {Route} from './+types/external-service';
import {redirect} from 'react-router';
import {siteContext} from '../context';
import {siteErrors} from '../errors.server';


export function meta() {
	return [{title: 'External Services \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	const {backend, user} = context.get(siteContext);
	if (!user) {
		throw redirect('/register');
	}
	const {searchParams} = new URL(request.url);
	return {
		alertDetails: searchParams.get('alertDetails'),
		alertType: searchParams.get('alertType'),
		cbPermission: await backend.externalService.getCritiqueBrainzPermission({editorId: user.id})
	};
});

export default function ExternalService({loaderData}: Route.ComponentProps) {
	return <ExternalServices {...loaderData}/>;
}
