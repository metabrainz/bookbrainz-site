var path = require('path');

global.rootRequire = function(name) {
	return require(path.join(__dirname, name));
};

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var staticCache = require('express-static-cache');

var auth = require('./helpers/auth');

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.basedir = app.get('views');

// webservice
app.set('webservice', 'http://bookbrainz.org/ws');

app.use(favicon(__dirname + '/public/images/favicon.ico'));

if (app.get('env') !== 'testing') {
	app.use(logger('dev'));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(staticCache(path.join(__dirname, 'public/js'), {
	buffer: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	store: new RedisStore({
		host: 'localhost',
		port: 6379,
		ttl: 3600
	}),
	secret: 'Something here!'
}));

auth.init(app);

app.use('/', routes);
app.use('/users', users);
app.use('/', login);
app.use('/', require('./routes/entity/create/creator'));
app.use('/', require('./routes/entity/create/publication'));
app.use('/', require('./routes/entity/view/creator'));
app.use('/', require('./routes/entity/view/publication'));
app.use('/', require('./routes/editor'));
app.use('/', require('./routes/register'));
app.use('/', require('./routes/relationship/edit'));
app.use('/', require('./routes/message'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		console.log(err.message);
		console.log(err.stack);
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	console.log(err.message);
	console.log(err.stack);
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;
