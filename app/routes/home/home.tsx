import Index from '../../../src/client/components/pages/index';
import React from 'react';
import type {Route} from './+types/home';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


const NUM_REVISIONS_ON_HOMEPAGE = 9;

export const loader = siteErrors(async ({context}: Route.LoaderArgs) => {
	const {backend, signUpDisabled, user} = context.get(siteContext);
	return {
		disableSignUp: signUpDisabled,
		isLoggedIn: Boolean(user),
		recent: await backend.revisions.getLatest({size: NUM_REVISIONS_ON_HOMEPAGE})
	};
});

export default function Home({loaderData}: Route.ComponentProps) {
	return <Index {...loaderData}/>;
}
