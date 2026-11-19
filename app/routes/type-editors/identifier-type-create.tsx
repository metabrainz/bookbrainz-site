import {requirePrivilege, requireUser} from '../../auth.server';
import IdentifierTypeEditor from '../../../src/client/components/forms/type-editor/identifier-type';
import {PrivilegeType} from '../../../src/common/helpers/privileges-utils';
import React from 'react';
import type {Route} from './+types/identifier-type-create';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export const loader = siteErrors(({context, request}: Route.LoaderArgs) => {
	requirePrivilege(PrivilegeType.IDENTIFIER_TYPE_EDITOR, {context, request});
	return context.get(siteContext).backend.typeEditors.getIdentifierTypeCreateData();
});

export default function IdentifierTypeEditorRoute({loaderData}: Route.ComponentProps) {
	return <IdentifierTypeEditor {...loaderData}/>;
}
