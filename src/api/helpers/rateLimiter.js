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

import {slowDown} from 'express-slow-down';


const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

/* Allow 100 requests per 5 minutes, then begin adding 500ms of delay per
   request above 100. Request #102 is delayed by 100ms, request #102 by 200ms,
   etc. */
export const lookupAndBrowseRequestSlowDown = slowDown({
	delayAfter: 100,
	delayMs(used) { return (used - this.delayAfter) * 500; },
	windowMs: FIVE_MINUTES_IN_MS
});

/* Allow 100 requests per 5 minutes, then begin adding 500ms of delay per
   request above 100. Request #102 is delayed by 100ms, request #102 by 200ms,
   etc. */
export const searchRequestSlowDown = slowDown({
	delayAfter: 100,
	delayMs(used) { return (used - this.delayAfter) * 500; },
	windowMs: FIVE_MINUTES_IN_MS
});


