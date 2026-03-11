/*
 * Copyright (C) 2015-2017  Ben Ockmore
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

import BookBrainzData from 'bookbrainz-data';
import _ from 'lodash';
import config from '../config/test.json' with { type: 'json' };

/* Unsure why, but this file is imported in two different ways when running tests
This causes the default export of the ORM package to be recognized different, hence 
the following check to identify the default export (init function) */
const initFunc = _.isFunction(BookBrainzData) ? BookBrainzData : BookBrainzData.default;
const orm = initFunc(config.database);

// opens up database connection for later use in tests
export default orm;
    