var relationshipHelper = require('./routes/relationship/edit');

function initRootRoutes(app) {
	app.use('/', require('./routes/index'));
	app.use('/', require('./routes/login'));
	app.use('/register', require('./routes/register'));
}

function initPublicationRoutes(app) {
	var router = require('./routes/entity/publication');

	app.use('/publication', router);
	relationshipHelper.addEditRoutes(router);
}

function initCreatorRoutes(app) {
	var router = require('./routes/entity/creator');

	app.use('/creator', router);
	relationshipHelper.addEditRoutes(router);
}

function initEditionRoutes(app) {
	var router = require('./routes/entity/edition');

	app.use('/edition', router);
	relationshipHelper.addEditRoutes(router);
}

function initWorkRoutes(app) {
	var router = require('./routes/entity/work');

	app.use('/work', router);
	relationshipHelper.addEditRoutes(router);
}

function initPublisherRoutes(app) {
	var router = require('./routes/entity/publisher');

	app.use('/publisher', router);
	relationshipHelper.addEditRoutes(router);
}

module.exports = function initRoutes(app) {
	initRootRoutes(app);

	initPublicationRoutes(app);
	initCreatorRoutes(app);
	initEditionRoutes(app);
	initWorkRoutes(app);
	initPublisherRoutes(app);

	app.use('/editor', require('./routes/editor'));
	app.use('/message', require('./routes/message'));
};
