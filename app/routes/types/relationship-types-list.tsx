import {NotFoundError} from '../../../src/common/helpers/error';
import React from 'react';
import type {RelationshipTypeDataT} from '../../../src/common/types/type-data';
import RelationshipTypesPage from '../../../src/client/components/pages/relationshipTypes';
import type {Route} from './+types/relationship-types-list';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export function meta({loaderData}: Route.MetaArgs) {
	return [{title: loaderData ? `${loaderData.heading} \u2013 BookBrainz` : 'Relationship Types \u2013 BookBrainz'}];
}

// The :types segment is "<entity type>-<entity type>", for example edition_group-author
export const loader = siteErrors(async ({context, params, request}: Route.LoaderArgs) => {
	// Split at the first hyphen, as the Express route /:type1-:type2 did; both parts must be there
	const hyphen = params.types.indexOf('-');
	if (hyphen < 1 || hyphen === params.types.length - 1) {
		const {pathname, search} = new URL(request.url);
		throw new NotFoundError(null, {originalUrl: `${pathname}${search}`});
	}
	const type1 = params.types.slice(0, hyphen);
	const type2 = params.types.slice(hyphen + 1);
	const {heading, relationshipTypes} = await context.get(siteContext).backend.types.getRelationshipTypesPage({type1, type2});
	// The data layer does not type the rows, so the page's own type is used
	return {heading, relationshipTypes: relationshipTypes as unknown as RelationshipTypeDataT[]};
});

export default function RelationshipTypesByEntityTypes({loaderData}: Route.ComponentProps) {
	return <RelationshipTypesPage {...loaderData}/>;
}
