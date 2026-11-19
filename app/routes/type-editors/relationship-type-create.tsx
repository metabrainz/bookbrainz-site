import {requirePrivilege, requireUser} from '../../auth.server';
import {PrivilegeType} from '../../../src/common/helpers/privileges-utils';
import React from 'react';
import RelationshipTypeEditor from '../../../src/client/components/forms/type-editor/relationship-type';
import type {Route} from './+types/relationship-type-create';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export const loader = siteErrors(({context, request}: Route.LoaderArgs) => {
	requirePrivilege(PrivilegeType.RELATIONSHIP_TYPE_EDITOR, {context, request});
	return context.get(siteContext).backend.typeEditors.getRelationshipTypeCreateData();
});

export default function RelationshipTypeEditorRoute({loaderData}: Route.ComponentProps) {
	return <RelationshipTypeEditor {...loaderData}/>;
}
