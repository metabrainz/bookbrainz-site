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

import * as achievement from '../../helpers/achievement';
import * as error from '../../helpers/error';
import * as propHelpers from '../../../client/helpers/props';
import * as search from '../../helpers/search';
import {escapeProps, generateProps} from '../../helpers/props';
import Layout from '../../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import _ from 'lodash';
import {entityEditorMarkup} from '../../helpers/entityRouteUtils';
import {entityToFormState} from './transform-import';
import {generateImportEntityProps} from '../../helpers/importEntityRouteUtils';
import {getEntityUrl} from '../../../client/helpers/entity';
import {getImportUrl} from '../../../client/helpers/import-entity';
import {getValidator} from '../../../client/entity-editor/helpers';
import importEntityPages from
	'../../../client/components/pages/import-entities';
import {transformForm} from './transform-form';
import uuid from 'uuid';


export function displayImport(req, res) {
	const {importEntity} = res.locals;

	// Get unique identifier types for display
	const identifierTypes = importEntity.identifierSet &&
		_.uniqBy(
			_.map(importEntity.identifierSet.identifiers, 'type'),
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

		res.render('target', {
			markup,
			props: escapeProps(props),
			script: '/js/import-entity/import-entity.js'
		});
	}
	else {
		throw new Error(
			`Component was not found for the following import: ${type}`
		);
	}
}

export function displayDiscardImportEntity(req, res) {
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

	res.render('target', {
		markup,
		props: escapeProps(props),
		script: '/js/import-entity/discard-import-entity.js'
	});
}

export function handleDiscardImportEntity(req, res) {
	const {orm} = req.app.locals;
	const editorId = req.session.passport.user.id;
	const {importEntity} = res.locals;
	orm.bookshelf.transaction(async (transacting) => {
		try {
			await orm.func.imports.castDiscardVote(
				transacting, importEntity.importId, editorId
			);
			// Todo: Add code to remove importEntity from the search index
			res.status(200).send();
		}
		catch (err) {
			res.status(400).send({error: err});
		}
	});
}

export async function approveImportEntity(req, res) {
	const {orm} = res.app.locals;
	const editorId = req.session.passport.user.id;
	const {importEntity} = res.locals;
	const entity = await orm.bookshelf.transaction((transacting) =>
		orm.func.imports.approveImport(
			{editorId, importEntity, orm, transacting}
		));
	const entityUrl = getEntityUrl(entity);

	/* Add code to remove import and add the newly created entity to the elastic
		search index and remove delete import */

	// Update editor achievement
	entity.alert = (await achievement.processEdit(
		orm, editorId, entity.revisionId
	)).alert;

	// Cleanup search indexing
	search.indexEntity(entity);
	// Todo: Add functionality to remove imports from ES index upon deletion

	res.redirect(entityUrl);
}

export function editImportEntity(req, res) {
	const {importEntity} = res.locals;
	const initialState = entityToFormState(importEntity);
	const importEntityProps = generateImportEntityProps(
		req, res, initialState, {}
	);
	const {markup, props} = entityEditorMarkup(importEntityProps);
	return res.render('target', {
		markup,
		props: escapeProps(props),
		script: '/js/entity-editor.js',
		title: 'Edit Work Import'
	});
}

export async function approveImportPostEditing(req, res) {
	const {orm} = req.app.locals;
	const {importEntity} = res.locals;
	const editorId = req.session.passport.user.id;
	const {importId, type} = importEntity;
	const formData = req.body;

	const validateForm = getValidator(type.toLowerCase());

	if (!validateForm(formData)) {
		const err = new error.FormSubmissionError();
		error.sendErrorAsJSON(res, err);
	}

	const entityData = transformForm[type](formData);

	const entity = await orm.bookshelf.transaction(async (transacting) => {
		await orm.func.imports.deleteImport(
			transacting, importId
		);
		return orm.func.createEntity(
			{editorId, entityData, orm, transacting}
		);
	});

	// Update editor achievement
	entity.alert = (await achievement.processEdit(
		orm, editorId, entity.revisionId
	)).alert;

	// Cleanup search indexing
	await search.indexEntity(entity);
	// To-do: Add code to remove importEntity from the search index

	res.send(entity);
}
