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
const moment = require('moment');
/**
 * Injects entity model object with a default alias name property.
 *
 * @param {object} instance - Entity object.
 * @returns {object} - New object with injected properties.
 */
function injectDefaultAliasName(instance) {
	'use strict';
	if (instance && instance.name) {
		return Object.assign({}, instance, {
			defaultAlias: {
				name: instance.name
			}
		});
	}
	return instance;
}

function formatDate(date, includeTime) {
	'use strict';
	const formatter = moment(date);
	if (includeTime) {
		return formatter.format('YYYY-MM-DD HH:mm:ss');
	}
	return formatter.format('YYYY-MM-DD');
}

function isWithinDay(date) {
	'use strict';
	return Boolean(Date.now() - date.getTime() < 86400000);
}

exports.injectDefaultAliasName = injectDefaultAliasName;
exports.formatDate = formatDate;
exports.isWithinDay = isWithinDay;
