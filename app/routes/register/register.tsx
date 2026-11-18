import React from 'react';
import RegisterAuthPage from '../../../src/client/components/pages/registration-auth';
import type {Route} from './+types/register';
import {redirect} from 'react-router';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Register \u2013 BookBrainz'}];
}

export const loader = siteErrors(({context}: Route.LoaderArgs) => {
	const {user} = context.get(siteContext);
	if (user) {
		throw redirect(`/editor/${user.id}`);
	}
	return null;
});

export default function Register() {
	return <RegisterAuthPage/>;
}
