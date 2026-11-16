import {NotFoundError} from '../../../src/common/helpers/error';
import ProfileForm from '../../../src/client/components/forms/profile';
import React from 'react';
import type {Route} from './+types/edit';
import {requireUser} from '../../auth.server';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export const loader = siteErrors(async ({context, request}: Route.LoaderArgs) => {
	const {backend, user} = context.get(siteContext);
	// requireUser has run, so there is a user
	const data = user && await backend.editors.getProfileEditData({editorId: user.id});
	if (!data) {
		const {pathname, search} = new URL(request.url);
		throw new NotFoundError('Editor not found', {originalUrl: `${pathname}${search}`});
	}
	return data;
});

export default function EditProfile({loaderData}: Route.ComponentProps) {
	return <ProfileForm editor={loaderData.editor} genders={loaderData.genders} titles={loaderData.titles}/>;
}
