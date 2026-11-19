import {requirePrivilege, requireUser} from '../../auth.server';
import IdentifierTypeEditor from '../../../src/client/components/forms/type-editor/identifier-type';
import {PrivilegeType} from '../../../src/common/helpers/privileges-utils';
import React from 'react';
import type {Route} from './+types/identifier-type-edit';
import {siteContext} from '../../context';
import {siteErrors} from '../../errors.server';


export const middleware = [requireUser];

export const loader = siteErrors(({context, params, request}: Route.LoaderArgs) => {
	requirePrivilege(PrivilegeType.IDENTIFIER_TYPE_EDITOR, {context, request});
	return context.get(siteContext).backend.typeEditors.getIdentifierTypeEditData({id: params.id, path: new URL(request.url).pathname});
});

export default function IdentifierTypeEditorRoute({loaderData}: Route.ComponentProps) {
	return <IdentifierTypeEditor {...loaderData}/>;
}
