var express = require('express');
var router = express.Router();
var request = require('superagent');
require('superagent-bluebird-promise');
var Promise = require('bluebird');

router.get('/editor/:id', function(req, res) {
  // Get the list of publication types
  var ws = req.app.get('webservice');

  var userPromise = request.get(ws + '/user/' + req.params.id).promise();
  var userStatsPromise = request.get(ws + '/user/' +
                                     req.params.id + '/stats').promise();

  function renderEditorTemplate(user, stats) {
    res.render('editor/editor', {
      session: req.session,
      user: user,
      stats: stats
    });
  }

  userStatsPromise.then(function(stats) {
    userPromise.then(function(user) {
      renderEditorTemplate(user.body, stats.body);
    });
  }).catch(function(error) {
    userPromise.then(function(user) {
      renderEditorTemplate(user.body, null);
    });
  });
});

module.exports = router;
