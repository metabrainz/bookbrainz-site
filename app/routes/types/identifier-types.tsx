import IdentifierTypesPage from '../../../src/client/components/pages/identifierTypes';
import React from 'react';
import type {Route} from './+types/identifier-types';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Identifier Types \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context}: Route.LoaderArgs) => ({
	identifierTypes: await context.get(siteContext).backend.types.getIdentifierTypes()
}));

export default function IdentifierTypes({loaderData}: Route.ComponentProps) {
	return <IdentifierTypesPage {...loaderData}/>;
}
