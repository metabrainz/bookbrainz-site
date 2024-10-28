/*
 * Copyright (C) 2016 Ben Ockmore
 *               2018 Shivam Tripathi
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
// TODO: delete unused functions and move into `../entity`

import * as achievement from '../../helpers/achievement';
import * as error from '../../../common/helpers/error';
import * as propHelpers from '../../../client/helpers/props';
import * as search from '../../../common/helpers/search';
import type {NextFunction, Request, Response} from 'express';
import {escapeProps, generateProps} from '../../helpers/props';
import {map, uniqBy} from 'lodash';
import Layout from '../../../client/containers/layout';
import {type ORM} from 'bookbrainz-data';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {entityEditorMarkup} from '../../helpers/entityRouteUtils';
import {entityToFormState} from './transform-import';
import {generateImportEntityProps} from '../../helpers/importEntityRouteUtils';
import {getEntityUrl} from '../../../client/helpers/entity';
import {getImportUrl} from '../../../client/helpers/import-entity';
import {getValidator} from '../../../client/entity-editor/helpers';
import importEntityPages from
	'../../../client/components/pages/import-entities';
import target from '../../templates/target';
import {transformForm} from './transform-form';


// TODO: will be unused
export function displayImport(req: Request, res: Response) {
	const {importEntity} = res.locals;

	// Get unique identifier types for display
	const identifierTypes = importEntity.identifierSet &&
		uniqBy(
			map(importEntity.identifierSet.identifiers, 'type'),
			(type) => type.id
		);

	const {type} = importEntity;
	const ImportEntityComponent = importEntityPages[type];
	if (ImportEntityComponent) {
		const props = generateProps(req, res, {identifierTypes});
		const markup = ReactDOMServer.renderToString(
			<Layout {...propHelpers.extractLayoutProps(props)}>
				<ImportEntityComponent
					{...propHelpers.extractImportEntityProps(props)}
				/>
			</Layout>
		);

		res.send(target({
			markup,
			props: escapeProps(props),
			script: '/js/import-entity/import-entity.js'
		}));
	}
	else {
		throw new Error(
			`Component was not found for the following import: ${type}`
		);
	}
}

export function displayDiscardImportEntity(req: Request, res: Response) {
	const {importEntity} = res.locals;
	const importUrl = getImportUrl(importEntity);

	if (importEntity.hasVoted) {
		res.redirect(importUrl);
	}

	const props = generateProps(req, res);
	const {DiscardImportEntityPage} = importEntityPages;
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<DiscardImportEntityPage
				importEntity={props.importEntity}
			/>
		</Layout>
	);

	res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/import-entity/discard-import-entity.js'
	}));
}

export function handleDiscardImportEntity(req, res: Response) {
	const {orm}: {orm: ORM} = req.app.locals;
	const editorId = req.session.passport.user.id;
	const {importEntity} = res.locals;
	orm.bookshelf.transaction(async (transacting) => {
		try {
			await orm.func.imports.castDiscardVote(
				transacting, importEntity.bbid, editorId
			);
			// Todo: Add code to remove importEntity from the search index
			res.status(200).send();
		}
		catch (err) {
			res.status(400).send({error: err});
		}
	});
}

export async function approveImportEntity(req, res: Response, next: NextFunction) {
	const orm: ORM = res.app.locals.orm;
	const editorId = req.session.passport.user.id;
	const {entity} = res.locals;

	try {
		await orm.func.imports.approveImport({editorId, importEntity: entity, orm});
	} catch (error) {
		return next(error);
	}

	const Model = orm.func.entity.getEntityModelByType(orm, entity.type);
	const savedEntityModel = await new Model({bbid: entity.bbid})
		.fetch({
			require: true,
			withRelated: ['defaultAlias'],
		});
	const entityJSON = savedEntityModel.toJSON();
	const entityUrl = getEntityUrl(entityJSON);

	/* Add code to remove import and add the newly created entity to the elastic
		search index and remove delete import */

	// Update editor achievement
	// TODO: alert is never used?
	entityJSON.alert = (await achievement.processEdit(
		orm, editorId, entityJSON.revisionId
	)).alert;

	// Cleanup search indexing
	search.indexEntity(savedEntityModel);
	// Todo: Add functionality to remove imports from ES index upon deletion

	res.redirect(entityUrl);
}

export function editImportEntity(req: Request, res: Response) {
	const {importEntity} = res.locals;
	const initialState = entityToFormState(importEntity);
	const additionalProps: Record<string, any> = {};
	if (res.locals.genders) {
		additionalProps.genderOptions = res.locals.genders;
	}
	const importEntityProps = generateImportEntityProps(
		req, res, initialState, additionalProps
	);
	const {markup, props} = entityEditorMarkup(importEntityProps);
	return res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/entity-editor.js',
		title: 'Edit Import'
	}));
}

export async function approveImportPostEditing(req, res) {
	const {orm}: {orm: ORM} = req.app.locals;
	const {importEntity} = res.locals;
	const editorId = req.session.passport.user.id;
	const {bbid: importBbid, type} = importEntity;
	const formData = req.body;

	const validateForm = getValidator(type);

	if (!validateForm(formData)) {
		const err = new error.FormSubmissionError();
		error.sendErrorAsJSON(res, err);
	}

	const entityData = transformForm[type](formData);

	const savedEntityModel = await orm.bookshelf.transaction(async (transacting) => {
		await orm.func.imports.deleteImport(
			transacting, importBbid
		);
		return orm.func.createEntity(
			{editorId, entityData, orm, transacting}
		);
	});
	const entityJSON = savedEntityModel.toJSON();

	// Update editor achievement
	entityJSON.alert = (await achievement.processEdit(
		orm, editorId, entityJSON.revisionId
	)).alert;

	// Cleanup search indexing
	await search.indexEntity(savedEntityModel);
	// To-do: Add code to remove importEntity from the search index

	res.send(entityJSON);
}
