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
import * as middleware from '../../helpers/middleware';
import {PrivilegeType} from '../../../common/helpers/privileges-utils';
import express from 'express';
import {identifierTypeCreateOrEditHandler} from '../../helpers/typeRouteUtils';


const router = express.Router();

const {IDENTIFIER_TYPE_EDITOR} = PrivilegeType;

router.post('/create/handler', auth.isAuthenticatedForHandler, auth.isAuthorized(IDENTIFIER_TYPE_EDITOR), identifierTypeCreateOrEditHandler);

router.param(
	'id',
	middleware.checkValidTypeId
);

router.post('/:id/edit/handler', auth.isAuthenticatedForHandler, auth.isAuthorized(IDENTIFIER_TYPE_EDITOR), identifierTypeCreateOrEditHandler);

export default router;
