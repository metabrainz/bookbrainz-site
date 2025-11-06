/*
 * Copyright (C) 2025 Ansh Goyal
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

import {BadRequestError, NotFoundError} from '../../common/helpers/error';
import type {ORM} from 'bookbrainz-data';
import express from 'express';

const router = express.Router();

router.get('/:username', async (req, res, next) => {
	const {Editor} = req.app.locals.orm as ORM;
	const {username} = req.params;

	if (!username) {
		return next(new BadRequestError('Username is required', req));
	}

	try {
		const editor = await new Editor()
			.where('cached_metabrainz_name', username)
			.fetch({require: true})
			.catch(Editor.NotFoundError, () => {
				throw new NotFoundError('Editor not found', req);
			});

		const editorId = editor.get('id');
		return res.redirect(301, `/editor/${editorId}`);
	}
	catch (err) {
		return next(err);
	}
});

export default router;

