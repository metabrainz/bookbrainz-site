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


router.post('/publication/create/handler', function(req, res) {
  var ws = req.app.get('webservice');

  console.log(req.body);

  if (!req.body.edit) {
    console.log('Make new edit!');
  }
  // If 'new edit' in form, create a new edit.
  //var editPromise = request.post(ws + '/edits')
  //.set('Authorization', 'Bearer ' + req.session.oauth.access_token).promise();
  var changes = {
    'entity_gid': [],
    'publication_data': {
      'publication_type_id': parseInt(req.body.type)
    }
  };

  if (req.body.disambiguation) {
    changes.disambiguation = req.body.disambiguation;
  }

  if (req.body.name && req.body.sort_name) {
    changes.aliases = [{
      'name': req.body.name,
      'sort_name': req.body.sort_name,
      'language_id': 1
    }];
  }

  request.post(ws + '/revisions')
  .set('Authorization', 'Bearer ' + req.session.oauth.access_token)
  .send(changes).promise()
  .then(function(revision) {
    res.redirect(303, '/publication/' + revision.body.entity.gid);
  })
});

module.exports = router;
