/*
 * Copyright (C) 2016  Daniel Hsing
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

import {Request, Response} from 'express';
import jsesc from 'jsesc';


type PassportRequest = Request & {user: any, session: any};

// JSON.stringify that escapes characters in string output
export function escapeProps(props) {
	return jsesc(props, {
		isScriptContext: true,
		json: true
	});
}

export function generateProps<T>(req: PassportRequest, res: Response, props?: T): T & Record<string, unknown> {
	const baseObject: Record<string, unknown> = {};
	if (req.session && req.session.mergeQueue) {
		baseObject.mergeQueue = req.session.mergeQueue;
	}
	return Object.assign(baseObject, res.locals, props);
}
