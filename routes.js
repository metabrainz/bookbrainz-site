function initRootRoutes(app) {
  app.use('/', require('./routes/index'));
  app.use('/', require('./routes/login'));
  app.use('/register', require('./routes/register'));
}

function initPublicationRoutes(app) {
  app.use('/publication', require('./routes/entity/publication'));
  app.use('/publication/:id/relationships', require('./routes/relationship/edit'));
}

function initCreatorRoutes(app) {
  app.use('/creator', require('./routes/entity/creator'));
  app.use('/creator/:id/relationships', require('./routes/relationship/edit'));
}

function initEditionRoutes(app) {
  app.use('/edition', require('./routes/entity/edition'));
  app.use('/edition/:id/relationships', require('./routes/relationship/edit'));
}

function initWorkRoutes(app) {
  app.use('/work', require('./routes/entity/work'));
  app.use('/work/:id/relationships', require('./routes/relationship/edit'));
}

function initPublisherRoutes(app) {
  app.use('/publisher', require('./routes/entity/publisher'));
  app.use('/publisher/:id/relationships', require('./routes/relationship/edit'));
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
