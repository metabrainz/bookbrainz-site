var express = require('express');
var router = express.Router();
var request = require('superagent');
require('superagent-bluebird-promise');

/* create publication endpoint */
router.get('/publication/create', function(req, res) {
  // Get the list of publication types
  var ws = req.app.get('webservice');
  request.get(ws + '/publicationType').promise().then(function(types) {
    res.render('create/publication', {
      session: req.session,
      publicationTypes: types.body
    });
  });
});

module.exports = router;
