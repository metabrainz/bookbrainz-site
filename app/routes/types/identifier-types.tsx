import type {IdentifierTypeDataT} from '../../../src/client/components/forms/type-editor/typeUtils';
import IdentifierTypesPage from '../../../src/client/components/pages/identifierTypes';
import React from 'react';
import type {Route} from './+types/identifier-types';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta() {
	return [{title: 'Identifier Types \u2013 BookBrainz'}];
}

export const loader = siteErrors(async ({context}: Route.LoaderArgs) => ({
	// The data layer does not type the rows, so the page's own type is used
	identifierTypes: await context.get(siteContext).backend.types.getIdentifierTypes() as unknown as IdentifierTypeDataT[]
}));

export default function IdentifierTypes({loaderData}: Route.ComponentProps) {
	return <IdentifierTypesPage {...loaderData}/>;
}
