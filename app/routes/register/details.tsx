import React from 'react';
import RegisterDetailPage from '../../../src/client/components/forms/registration-details';
import type {Route} from './+types/details';
import {capitalize} from 'lodash';
import {redirect} from 'react-router';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Register \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context}: Route.LoaderArgs) => {
	const {backend, session, user} = context.get(siteContext);
	if (user) {
		throw redirect(`/editor/${user.id}`);
	}
	const profile = session?.mbProfile;
	if (!profile) {
		throw redirect('/auth');
	}
	const genders = await backend.editors.getGenders();
	const gender = genders.find(({name}) => name === capitalize(profile.gender));
	return {gender, genders, name: profile.username};
});

export default function RegisterDetails({loaderData}: Route.ComponentProps) {
	return <RegisterDetailPage {...loaderData}/>;
}
