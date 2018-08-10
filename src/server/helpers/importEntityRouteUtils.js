/*
 * Copyright (C) 2018 Shivam Tripathi
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


/**
 * Returns a props object with reasonable defaults for import entity editing.
 * @param {request} req - request object
 * @param {response} res - response object
 * @param {object} initialState - The initial state of the edit page
 * to get the initial state
 * @param {object} additionalProps - additional props
 * @returns {object} - props
 */
export function generateImportEntityProps(
	req: express.request, res: express.response, initialState: Object,
	additionalProps: Object
): Object {
	const {importEntity} = res.locals;
	const {type: importEntityName} = importEntity;
	const importEntityType = importEntityName.toLowerCase();

	const getFilteredIdentifierTypes =
		_.partialRight(utils.filterIdentifierTypesByEntity, importEntity);
	const filteredIdentifierTypes = getFilteredIdentifierTypes(
		res.locals.identifierTypes
	);

	const submissionUrl =
		`/imports/${importEntityType}/${importEntity.importId}/edit/approve`;

	const props = Object.assign({
		entityType: importEntityType,
		heading: `Edit Import ${importEntityName}`,
		identifierTypes: filteredIdentifierTypes,
		importEntityType,
		initialState,
		languageOptions: res.locals.languages,
		requiresJS: true,
		subheading:
			`Edit and approve an import ${importEntityName} on BookBrainz`,
		submissionUrl
	}, additionalProps);

	return generateProps(req, res, props);
}
