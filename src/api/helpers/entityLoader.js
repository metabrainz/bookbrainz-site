/*
 * Copyright (C) 2019  Akhilesh Kumar
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

// @flow


import * as commonUtils from '../../common/helpers/utils';

/**
 * This is a middleware function to load entity detail according to given relations
 *
 * @param {string} modelName - Name of entity model
 * @param {string[]} relations - List of entity relations for fetching the related detail
 * @param {string} errMessage - Error message for responce, if any error will occur
 * @returns {object} responce - return entity datail with status code
 *
 * @example
 *
 *		makeEntityLoader(modelName: string, relations: array, errMessage: string)
 */


export function makeEntityLoader(modelName, relations, errMessage) {
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		if (commonUtils.isValidBBID(req.params.bbid)) {
			try {
				const entityData = await orm.func.entity.getEntity(orm, modelName, req.params.bbid, relations);
				res.locals.entity = entityData;
				return next();
			}
			catch (err) {
				return res.status(404).send({message: errMessage});
			}
		}
		return res.status(406).send({message: 'BBID is not valid uuid'});
	};
}
