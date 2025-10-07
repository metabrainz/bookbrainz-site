/*
 * Copyright (C) 2023 Shivam Awasthi
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import * as auth from '../../helpers/auth';
import * as error from '../../../common/helpers/error';
import * as middleware from '../../helpers/middleware';
import * as propHelpers from '../../../client/helpers/props';
import {escapeProps, generateProps} from '../../helpers/props';
import IdentifierTypeEditor from '../../../client/components/forms/type-editor/identifier-type';
import Layout from '../../../client/containers/layout';
import {PrivilegeType} from '../../../common/helpers/privileges-utils';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import {identifierTypeCreateOrEditHandler} from '../../helpers/typeRouteUtils';
import target from '../../templates/target';


const router = express.Router();

const {IDENTIFIER_TYPE_EDITOR} = PrivilegeType;

router.get('/create', auth.isAuthenticated, auth.isAuthorized(IDENTIFIER_TYPE_EDITOR),
	middleware.loadParentIdentifierTypes, (req, res) => {
		const {parentTypes} = res.locals;
		const props = generateProps(req, res, {
			parentTypes
		});
		const script = '/js/identifier-type-editor.js';
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<IdentifierTypeEditor {...propHelpers.extractChildProps(props)}/>
			</Layout>
		);
		res.send(target({
			markup,
			props: escapeProps(props),
			script
		}));
	});

router.post('/create/handler', auth.isAuthenticatedForHandler, auth.isAuthorized(IDENTIFIER_TYPE_EDITOR), identifierTypeCreateOrEditHandler);

router.param(
	'id',
	middleware.checkValidTypeId
);

router.get('/:id/edit', auth.isAuthenticated, auth.isAuthorized(IDENTIFIER_TYPE_EDITOR),
	middleware.loadParentIdentifierTypes, async (req, res, next) => {
		const {IdentifierType} = req.app.locals.orm;
		const {parentTypes} = res.locals;
		res.locals.parentTypes = parentTypes.filter(type => type.id !== parseInt(req.params.id, 10));
		try {
			const identifierType = await new IdentifierType({id: req.params.id})
				.fetch({require: true})
				.catch(IdentifierType.NotFoundError, () => {
					throw new error.NotFoundError(`IdentifierType with id ${req.params.id} not found`, req);
				});
			const identifierTypeData = identifierType.toJSON();
			const props = generateProps(req, res, {identifierTypeData});
			const script = '/js/identifier-type-editor.js';
			const markup = ReactDOMServer.renderToString(
				<Layout {...propHelpers.extractLayoutProps(props)}>
					<IdentifierTypeEditor
						identifierTypeData={props.identifierTypeData}
						{...propHelpers.extractChildProps(props)}
					/>
				</Layout>
			);
			return res.send(target({
				markup,
				props: escapeProps(props),
				script
			}));
		}
		catch (err) {
			return next(err);
		}
	});

router.post('/:id/edit/handler', auth.isAuthenticatedForHandler, auth.isAuthorized(IDENTIFIER_TYPE_EDITOR), identifierTypeCreateOrEditHandler);

export default router;
