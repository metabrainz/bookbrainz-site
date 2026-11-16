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

import * as auth from '../helpers/auth';
import * as handler from '../helpers/handler';
import * as search from '../../common/helpers/search';

import {PrivilegeType} from '../../common/helpers/privileges-utils';
import {snakeCase as _snakeCase} from 'lodash';
import express from 'express';


const {ADMIN} = PrivilegeType;

const router = express.Router();

router.get('/search', auth.isAuthenticated, auth.isAuthorized(ADMIN), (req, res) => {
	const {orm} = req.app.locals;
	const query = req.query.q;
	const type = 'editor';

	const {size, from} = req.query;

	const searchPromise = search.searchByName(orm, query, _snakeCase(type), size, from);

	handler.sendPromiseResult(res, searchPromise);
});


export default router;
