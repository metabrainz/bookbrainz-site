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

import app from '../app';
import slowDown from 'express-slow-down';

// TODO: Uncomment below line on production
//app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)


// We can again configure the rate limit according to use of API
export const lookupAndBrowseRequestSlowDown = slowDown({
	windowMs: 5 * 60 * 1000, // 5 minutes
	delayAfter: 100, // allow 100 requests per 5 minutes, then...
	delayMs: 100 // begin adding 500ms of delay per request above 100:
	// request # 101 is delayed by 100ms
	// request # 102 is delayed by 200ms
	// request # 103 is delayed by 300ms
	// etc.
});

// This is for search request, TODO: We will use it after merging the search endpoint
export const searchRequestSlowDown = slowDown({
	windowMs: 15 * 60 * 1000, // 15 minutes
	delayAfter: 100, // allow 100 requests per 15 minutes, then...
	delayMs: 500 // begin adding 500ms of delay per request above 100:
	// request # 101 is delayed by  500ms
	// request # 102 is delayed by 1000ms
	// request # 103 is delayed by 1500ms
	// etc.
});


