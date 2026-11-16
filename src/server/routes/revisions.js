/*
 * Copyright (C) 2020 Prabal Singh
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

import express from 'express';
import {getOrderedRevisions} from '../../backend/revisions';


const router = express.Router();

// eslint-disable-next-line consistent-return
router.get('/revisions', async (req, res, next) => {
	const {orm} = req.app.locals;
	const size = req.query.size ? parseInt(req.query.size, 10) : 20;
	const from = req.query.from ? parseInt(req.query.from, 10) : 0;

	try {
		const orderedRevisions = await getOrderedRevisions(from, size, orm);
		res.send(orderedRevisions);
	}
	catch (err) {
		return next(err);
	}
});

export default router;
