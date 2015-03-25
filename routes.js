function initRootRoutes(app) {
  app.use('/', require('./routes/index'));
  app.use('/', require('./routes/login'));
  app.use('/register', require('./routes/register'));
}

function initPublicationRoutes(app) {
  app.use('/publication/create', require('./routes/entity/create/publication'));
  app.use('/publication', require('./routes/entity/view/publication'));
  app.use('/publication/:id/relationships', require('./routes/relationship/edit'));
}

function initCreatorRoutes(app) {
  app.use('/creator/create', require('./routes/entity/create/creator'));
  app.use('/creator', require('./routes/entity/view/creator'));
  app.use('/creator/:id/relationships', require('./routes/relationship/edit'));
}

module.exports = function initRoutes(app) {
  initRootRoutes(app);

  initPublicationRoutes(app);
  initCreatorRoutes(app);

  app.use('/editor', require('./routes/editor'));
  app.use('/message', require('./routes/message'));
};
