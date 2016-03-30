/*
 * Copyright (C) 2016  Ben Ockmore
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

'use strict';

module.exports.displayRevisions = (req, res, RevisionModel) => {
	const entity = res.locals.entity;
	let title = entity.type;

	if (entity.defaultAlias && entity.defaultAlias.name) {
		title += ` “${entity.defaultAlias.name}”`;
	}

	const bbid = req.params.bbid;
	return new RevisionModel()
		.where({bbid})
		.fetchAll({withRelated: ['revision', 'revision.author']})
		.then((collection) => {
			const revisions = collection.toJSON();
			return res.render('entity/revisions', {title, revisions});
		});
}
