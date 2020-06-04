/*
 * Copyright (C) 2015-2016  Sean Burke
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

import * as error from '../../common/helpers/error';
import * as propHelpers from '../../client/helpers/props';
import {escapeProps, generateProps} from './props';
import ErrorPage from '../../client/components/pages/error';
import Layout from '../../client/containers/layout';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import status from 'http-status';
import target from '../templates/target';


export function renderError(req, res, err) {
	const errorToSend = error.getErrorToSend(err);
	const props = generateProps(req, res, {
		error: errorToSend
	});
	const markup = ReactDOMServer.renderToString(
		<Layout {...propHelpers.extractLayoutProps(props)}>
			<ErrorPage
				error={props.error}
			/>
		</Layout>
	);
	if (errorToSend.message) {
		res.statusMessage = errorToSend.message;
	}
	res.status(
		errorToSend.status || status.INTERNAL_SERVER_ERROR
	).send(target({
		markup,
		page: 'Error',
		props: escapeProps(props),
		script: '/js/error.js'
	}));
}
