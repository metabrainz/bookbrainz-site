/*
 * Copyright (C) 2015  Ben Ockmore
 *               2015  Sean Burke
 *               2015  Annie Zhou
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

import * as error from '../helpers/error';
import * as handler from '../helpers/handler';
import * as middleware from '../helpers/middleware';
import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from '../helpers/props';
import Layout from '../../client/containers/layout';
import Log from 'log';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RegisterAuthPage from '../../client/components/pages/registration-auth';
import RegisterDetailPage from
	'../../client/components/forms/registration-details';
import _ from 'lodash';
import config from '../helpers/config';
import express from 'express';
import target from '../templates/target';


const router = express.Router();
const log = new Log(config.site.log);

router.get('/', (req, res) => {
	// Check whether the user is logged in - if so, redirect to profile page
	if (req.user) {
		return res.redirect(`/editor/${req.user.id}`);
	}

	const props = generateProps(req, res);

	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<RegisterAuthPage/>
		</Layout>
	);

	return res.send(target({markup, title: 'Register'}));
});

router.get('/details', middleware.loadGenders, (req, res) => {
	// Check whether the user is logged in - if so, redirect to profile page
	if (req.user) {
		return res.redirect(`/editor/${req.user.id}`);
	}

	if (!req.session.mbProfile) {
		res.redirect('/auth');
	}

	const gender = _.find(res.locals.genders, {
		name: _.capitalize(req.session.mbProfile.gender)
	});

	const props = generateProps(req, res, {
		gender,
		genders: res.locals.genders,
		name: req.session.mbProfile.sub
	});

	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<RegisterDetailPage
				gender={props.gender}
				genders={props.genders}
				name={props.name}
			/>
		</Layout>
	);

	return res.send(target({
		markup,
		props: escapeProps(props),
		script: '/js/registrationDetails.js',
		title: 'Register'
	}));
});

router.post('/handler', (req, res) => {
	const {Editor, EditorType} = req.app.locals.orm;

	// Check whether the user is logged in - if so, redirect to profile page
	if (req.user) {
		return res.redirect(`/editor/${req.user.id}`);
	}

	if (!req.session.mbProfile) {
		return res.redirect('/auth');
	}

	// Fetch the default EditorType from the database
	const registerPromise = EditorType.forge({label: 'Editor'})
		.fetch({require: true})
		.then(
			// Create a new Editor and add to the database
			(editorType) =>
				new Editor({
					birthDate: req.body.birthday,
					cachedMetabrainzName: req.session.mbProfile.sub,
					genderId: req.body.gender,
					metabrainzUserId: req.session.mbProfile.metabrainz_user_id,
					name: req.body.displayName,
					typeId: editorType.id
				})
					.save()
		)
		.then((editor) => {
			req.session.mbProfile = null;
			return editor.toJSON();
		})
		.catch((err) => {
			log.debug(err);

			if (_.isMatch(err, {constraint: 'editor_name_key'})) {
				throw new error.FormSubmissionError(
					'That username already exists - please try using another,' +
					' or contact us to have your existing BookBrainz account' +
					' linked to a MusicBrainz account.'
				);
			}

			throw new error.FormSubmissionError(
				'Something went wrong when registering, please try again!'
			);
		});

	return handler.sendPromiseResult(res, registerPromise);
});

export default router;
