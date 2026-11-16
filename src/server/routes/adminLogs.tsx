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
import {getIntFromQueryParams, parseQuery} from '../helpers/utils';
import express from 'express';
import {getOrderedAdminLogs} from '../../backend/admin';


const router = express.Router();

// eslint-disable-next-line consistent-return
router.get('/admin-logs', auth.isAuthenticated, async (req, res, next) => {
	const {orm} = req.app.locals;
	const query = parseQuery(req.url);
	const size = getIntFromQueryParams(query, 'size', 20);
	const from = getIntFromQueryParams(query, 'from');

	try {
		const orderedLogs = await getOrderedAdminLogs(from, size, orm);
		res.json(orderedLogs);
	}
	catch (err) {
		return next(err);
	}
});

export default router;
