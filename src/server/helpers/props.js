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

export function generateProps(req, res, props) {
	return Object.assign({}, req.app.locals, res.locals, props);
}

export function extractLayoutProps(props) {
	return {
		hideSearch: props.hideSearch,
		homepage: props.homepage,
		repositoryUrl: props.repositoryUrl,
		siteRevision: props.siteRevision,
		user: props.user
	};
}

export function extractEditorProps(props) {
	return {
		editor: props.editor,
		tabActive: props.tabActive
	};
}

export function extractEntityProps(props) {
	return {
		alert: props.alert,
		entity: props.entity,
		identifierTypes: props.identifierTypes
	};
}
