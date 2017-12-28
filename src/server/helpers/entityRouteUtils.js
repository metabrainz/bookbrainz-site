/*
 * Copyright (C) 2017  Eshan Singh
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

import * as utils from './utils';
import _ from 'lodash';
import express from 'express';
import {generateProps} from './props';


type EntityAction = 'create' | 'edit';

/**
 * Returns a props object with reasonable defaults for entity creation/editing.
 * @param {string} entityType - entity type
 * @param {string} action - 'create' or 'edit'
 * @param {request} req - request object
 * @param {response} res - response object
 * @param {object} additionalProps - additional props
 * @returns {object} - props
 */
export function generateEntityProps(
	entityType: string, action: EntityAction,
	req: express.request, res: express.response,
	additionalProps: Object): Object {
	const entityName = _.capitalize(entityType);
	const props = Object.assign({
		entityType,
		heading: `${_.capitalize(action)} ${entityName}`,
		initialState: {},
		languageOptions: res.locals.languages,
		requiresJS: true,
		subheading: action === 'create' ?
			`Add a new ${entityName} to BookBrainz` :
			`Edit an existing ${entityName} on BookBrainz`
	}, additionalProps);

	return generateProps(req, res, props);
}
