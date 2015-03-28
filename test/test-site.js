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
