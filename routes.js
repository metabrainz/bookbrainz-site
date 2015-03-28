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

module.exports = function initRoutes(app) {
  initRootRoutes(app);

  initPublicationRoutes(app);
  initCreatorRoutes(app);

  app.use('/editor', require('./routes/editor'));
  app.use('/message', require('./routes/message'));
};
