/* eslint-disable */
/*
 * Copyright (C) 2019  Akhilesh Kumar
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

import slowDown from 'express-slow-down';

export const lookupAndBrowseRequestSlowDown = slowDown({
	windowMs: 5 * 60 * 1000, // 5 minutes
	delayAfter: 100, // allow 100 requests per 5 minutes, then...
	delayMs: 500 // begin adding 500ms of delay per request above 100:
	// request # 101 is delayed by 100ms
	// request # 102 is delayed by 200ms
	// etc.
});

export const searchRequestSlowDown = slowDown({
	windowMs: 5 * 60 * 1000, // 5 minutes
	delayAfter: 100, // allow 100 requests per 5 minutes, then...
	delayMs: 500 // begin adding 500ms of delay per request above 100:
});


