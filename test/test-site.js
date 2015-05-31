/*
 * Copyright (C) 2015  Sean Burke
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

process.env.NODE_ENV = 'testing';

var request = require('supertest');
var app = require('../app');

describe('GET /', function() {
	it('should return 200', function(done) {
		request(app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(200, done);
	});
});

describe('GET /about', function() {
	it('should return 200', function(done) {
		request(app)
			.get('/about')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(200, done);
	});
});

describe('GET /contribute', function() {
	it('should return 200', function(done) {
		request(app)
			.get('/contribute')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(200, done);
	});
});

describe('GET /develop', function() {
	it('should return 200', function(done) {
		request(app)
			.get('/develop')
			.expect('Content-Type', 'text/html; charset=utf-8')
			.expect(200, done);
	});
});
