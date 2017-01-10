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
/* eslint-disable react/display-name */
const React = require('react');
const formatDate = require('./utils').formatDate;
const _ = require('lodash');

function extractAttribute(attr, path) {
	'use strict';
	if (attr) {
		if (path) {
			return _.get(attr, path, '?');
		}
		return attr;
	}
	return '?';
}

function showEntityType(entityType) {
	'use strict';
	return (
		<div>
			<dt>Type</dt>
			<dd>{extractAttribute(entityType, 'label')}</dd>
		</div>
	);
}

function showBeginEndDate(entity) {
	'use strict';
	return (
		<div>
			<dt>Begin Date</dt>
			<dd>{extractAttribute(formatDate(new Date(entity.beginDate)))}</dd>
			{entity.ended &&
				<div>
					<dt>End Date</dt>
					<dd>{extractAttribute(
						formatDate(new Date(entity.endDate))
					)}</dd>
				</div>
			}
		</div>
	);
}

exports.extractAttribute = extractAttribute;
exports.showEntityType = showEntityType;
exports.showBeginEndDate = showBeginEndDate;
