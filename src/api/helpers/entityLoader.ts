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

import * as commonUtils from '../../common/helpers/utils';
import log from 'log';


/**
 * This is a middleware function to load entity detail according to given relations
 *
 * @param {string} modelName - Name of entity model
 * @param {string[]} relations - List of entity relations for fetching the related detail
 * @param {string} errMessage - Error message, if any error will occur
 * @param {boolean} isBrowse - Whether this is a browse endpoint (as opposed to
 *        an endpoint for a specific entity).
 * @returns {object} an object containing the error message if any error will occur.
 * If entity is found successfully in the database this function set the entity data
 * at res.locals.entity and return to next function.
 * @example
 *		const errorMessage = 'Edition not found'';
 *		makeEntityLoader('Edition', ['defaultAlias.language', 'editionStatus'], errMessage);
 *
 * @description
 * First, check the BBID is valid or not.
 * If BBID is valid then extract the entity data from database by using BBID and relations of
 * that entity. If entity is found successfully then set that entity data to the res.locals.entity
 * otherwise return an object {message: errMessage} as response with status code 404.
 * If the BBID is not valid then return a status code 400 and an object {message: 'BBID is not valid uuid'}.
 */
export function makeEntityLoader(modelName, relations, errMessage, isBrowse) {
	return async (req, res, next) => {
		const {orm} = req.app.locals;
		const bbid = isBrowse ? req.query.bbid : req.params.bbid;
		const model = isBrowse ? req.query.modelType : modelName;
		if (commonUtils.isValidBBID(bbid)) {
			try {
				res.locals.entity = await orm.func.entity.getEntity(orm, model, bbid, relations);
				return next();
			}
			catch (err) {
				log.error(err);
				return res.status(404).send({context: err, message: errMessage});
			}
		}
		return res.status(400).send({message: 'BBID is not valid uuid'});
	};
}
