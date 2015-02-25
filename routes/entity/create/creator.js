var express = require('express');
var router = express.Router();
var request = require('superagent');
var Promise = require('bluebird');
require('superagent-bluebird-promise');

router.get('/creator/create', function(req, res) {
  // Get the list of publication types
  var ws = req.app.get('webservice');

  var gendersPromise = request.get(ws + '/gender').promise();
  var creatorTypesPromise = request.get(ws + '/creatorType').promise();

  creatorTypesPromise.then(function(creatorTypes) { console.log(creatorTypes.body);});

  Promise.join(gendersPromise, creatorTypesPromise,
  function(genders, creatorTypes) {
    var gender_list = genders.body.objects.sort(function(a, b) { return a.id > b.id; });
    res.render('entity/create/creator', {
      session: req.session,
      genders: gender_list,
      creatorTypes: creatorTypes.body
    });
  });
});


router.post('/creator/create/handler', function(req, res) {
  var ws = req.app.get('webservice');

  console.log(req.body);

  if (!req.body.editId) {
    console.log('Make new edit!');
  }

  // If 'new edit' in form, create a new edit.
  var editPromise = request.post(ws + '/edits')
  .send({})
  .set('Authorization', 'Bearer ' + req.session.oauth.access_token).promise();

  var changes = {
    'entity_gid': [],
    'creator_data': {
      'ended': req.body.ended
    }
  };

  if (req.body.creatorTypeId) {
    changes.creator_data.creator_type_id = req.body.creatorTypeId;
  }

  if (req.body.genderId) {
    changes.creator_data.gender_id = req.body.genderId;
  }

  if (req.body.beginDate) {
    changes.creator_data.begin_date = req.body.beginDate;
  }

  if (req.body.endDate) {
    changes.creator_data.end_date = req.body.endDate;
  }

  if (req.body.disambiguation) {
    changes.disambiguation = req.body.disambiguation;
  }

  if (req.body.annotation) {
    changes.annotation = req.body.annotation;
  }

  changes.aliases = req.body.aliases.map(function(alias) {
    return {
      'name': alias.name,
      'sort_name': alias.sortName,
      'language_id': 1
    };
  });

  editPromise.then(function(edit) {
    changes.edit_id = edit.body.id;

    request.post(ws + '/revisions')
    .set('Authorization', 'Bearer ' + req.session.oauth.access_token)
    .send(changes).promise()
    .then(function(revision) {
      res.send(revision.body);
    });
  });
});

module.exports = router;
